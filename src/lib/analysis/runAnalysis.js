import { tick } from "svelte";

const shortFileMatcher = /(\/|^).{1,2}\.class$/i;
const executableMatcher = /(\/|^)[a-z0-9-]+\.(jar|exe|dll)$/i;
const obfuscators = [
  { name: "Bozar", regex: /(?=[Il]{9,})(?:(?:I+l+)+I+)/i },
  { name: "Branchlock", regex: /branchlock/i },
  {
    name: "Skidfuscator",
    regex: /nothing_to_see_here|thisIsAInsaneEncryptionMethod/i,
  },
];
export const runAnalysis = async (file, analysis, progress) => {
  const shortFiles = file.files.filter((f) => shortFileMatcher.test(f));
  const executableFiles = file.files.filter((f) => executableMatcher.test(f));

  const appendNoDupe = (flag) =>
    analysis.update((a) => {
      const obfuscation = a.obfuscation;
      if (!obfuscation.some((o) => o.name == flag.name)) obfuscation.push(flag);
      return { ...a, obfuscation };
    });
  const obfuscationFlags = [];
  if (shortFiles.length > 2)
    obfuscationFlags.push({
      name: "Possible obfuscation (many short file names)",
      file: shortFiles[0],
    });
  if (executableFiles.length > 0)
    obfuscationFlags.push({ name: "Non-scanned executable files", file: executableFiles[0] });
  analysis.update((a) => ({ ...a, obfuscation: obfuscationFlags }));
  file.files.map((f) => {
    obfuscators.forEach((obf) => {
      if (obf.regex.test(f)) appendNoDupe({ name: "Obfuscator " + obf.name, file: f });
    });
  });
  await tick();

  const filesToCheck = file.files.filter(
    (path) => /manifest\.mf$/i.test(path) || path.endsWith(".class")
  );
  progress.set({ done: 0, total: filesToCheck.length });
  await Promise.all(
    filesToCheck.map(async (path) => {
      const thisFile = file.zip.files[path];
      const contents = await thisFile.async("string");
      if (/manifest\.mf$/i.test(path)) {
        const protectedLine = contents.match(/^(?=.*protected).*$/im);
        if (protectedLine)
          appendNoDupe({
            name: "Obfuscator noted in manifest.mf",
            example: protectedLine.join("\n"),
          });
        progress.update((p) => ({ ...p, done: p.done + 1 }));
        return;
      }
      obfuscators.forEach((obf) => {
        if (obf.regex.test(contents)) appendNoDupe({ name: "Obfuscator " + obf.name, file: path });
      });
      if (/\p{Script=Han}{5}/u.test(contents) && contents.includes("reflect"))
        appendNoDupe({ name: "Obfuscator Stringer", file: path });
      progress.update((p) => ({ ...p, done: p.done + 1 }));
      await tick();
    })
  );
  // todo: cache results
};
