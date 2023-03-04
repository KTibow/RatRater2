import aiofiles, asyncio
from tempfile import gettempdir
from contextlib import AsyncExitStack
from zipfile import ZipFile, ZIP_DEFLATED
from pathlib import Path
from io import BytesIO
from sanic import Sanic
from sanic.response import text, raw, file
from sanic.exceptions import SanicException
from sanic.request import Request, File
from sanic_ext import Extend

app = Sanic("RatRaterBackend")
app.config.CORS_ORIGINS = "https://ktibow.github.io,http://localhost:5173"
Extend(app)


@app.post("/decompile")
async def decompile(request: Request):
    decompiler = request.args.get("decompiler")
    decompilee = request.files and request.files.get("file")
    if not decompiler:
        raise SanicException("No decompiler specified", 400)
    if not decompilee or not isinstance(decompilee, File):
        raise SanicException("File not provided", 400)

    file_type = (
        ".jar"
        if decompilee.name.endswith(".jar")
        else (".class" if decompilee.name.endswith(".class") else None)
    )
    if len(decompilee.body) > (1000 * 1000 * 100) or file_type is None:
        raise SanicException("File is invalid", 422)

    async with AsyncExitStack() as stack:
        temp = await stack.enter_async_context(
            aiofiles.tempfile.NamedTemporaryFile("wb", suffix=file_type)
        )
        await temp.write(decompilee.body)
        await temp.flush()
        if decompiler == "cfr" and file_type == ".jar":
            temp_dir = await stack.enter_async_context(
                aiofiles.tempfile.TemporaryDirectory()
            )
            command = [
                "java",
                "-jar",
                "cfr-0.152.jar",
                str(temp.name),
                "--outputdir",
                temp_dir,
            ]
        elif decompiler == "cfr" and file_type == ".class":
            command = ["java", "-jar", "cfr-0.152.jar", str(temp.name)]
        elif decompiler == "forgeflower":
            command = [
                "java",
                "-jar",
                "forgeflower-2.0.627.2.jar",
                str(temp.name),
                gettempdir(),
            ]
        elif decompiler == "quiltflower" and file_type == ".jar":
            temp_out = await stack.enter_async_context(
                aiofiles.tempfile.NamedTemporaryFile("rb", suffix=file_type)
            )
            command = [
                "java",
                "-jar",
                "quiltflower-1.9.0.jar",
                str(temp.name),
                "--file",
                str(temp_out.name),
            ]
        elif decompiler == "quiltflower" and file_type == ".class":
            command = [
                "java",
                "-jar",
                "quiltflower-1.9.0.jar",
                str(temp.name),
                gettempdir(),
            ]
        elif decompiler == "procyon" and file_type == ".jar":
            temp_dir = await stack.enter_async_context(
                aiofiles.tempfile.TemporaryDirectory()
            )
            command = [
                "java",
                "-jar",
                "procyon-decompiler-0.6.0.jar",
                str(temp.name),
                "-o",
                temp_dir,
            ]
        elif decompiler == "procyon" and file_type == ".class":
            command = [
                "java",
                "-jar",
                "procyon-decompiler-0.6.0.jar",
                str(temp.name),
            ]
        else:
            raise SanicException("Invalid decompiler specified", 400)
        proc = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        if (decompiler == "cfr" or decompiler == "procyon") and file_type == ".jar":
            dir_path = Path(temp_dir)  # type: ignore
            zip_buffer = BytesIO()
            with ZipFile(zip_buffer, "w", ZIP_DEFLATED) as zip_file:
                for entry in dir_path.rglob("*"):
                    zip_file.write(entry, entry.relative_to(dir_path))
            return raw(zip_buffer.getvalue(), content_type="application/zip")
        elif (decompiler == "cfr" or decompiler == "procyon") and file_type == ".class":
            out = stdout.decode()
            if out:
                return text(out)
            else:
                return text(stderr.decode(), status=500)
        elif decompiler == "forgeflower" and file_type == ".jar":
            decompilee_path = Path(str(temp.name))
            decompilee_path = Path(gettempdir(), decompilee_path.name)
            return await file(decompilee_path, mime_type="application/zip")
        elif decompiler == "forgeflower" and file_type == ".class":
            decompilee_path = Path(str(temp.name))
            decompilee_path = Path(
                gettempdir(), decompilee_path.name.replace(".class", ".java")
            )
            return await file(decompilee_path, mime_type="text/plain")
        elif decompiler == "quiltflower" and file_type == ".jar":
            return await file(
                str(temp_out.name),  # type: ignore
                mime_type="application/zip",
            )
        elif decompiler == "quiltflower" and file_type == ".class":
            decompilee_path = Path(str(temp.name))
            decompilee_path = Path(
                gettempdir(), decompilee_path.name.replace(".class", ".java")
            )
            return await file(
                decompilee_path,
                mime_type="text/plain",
            )
