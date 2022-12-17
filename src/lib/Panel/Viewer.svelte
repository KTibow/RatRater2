<script>
  import Monaco from "$lib/Files/Monaco.svelte";
  import { decompile } from "$lib/Files/decomp.js";
  import Button from "$lib/Button.svelte";
  import Icon from "@iconify/svelte";

  import java from "@iconify-icons/mdi/language-java";
  import cloudLoad from "@iconify-icons/mdi/cloud-sync";
  import fileRestore from "@iconify-icons/mdi/file-restore";
  import save from "@iconify-icons/mdi/content-save";
  import close from "@iconify-icons/mdi/close";

  export let zip;
  export let path;
  let rawFile;
  let decompiled = { status: 0 };

  let editorContents;
  $: {
    console.log(zip, path);
    if (!zip || !path || !zip.files[path]) break $;
    zip.files[path].async("text").then((data) => (rawFile = data));
  }
  $: {
    if (!editorContents || rawFile == null) break $;
    if (decompiled.for && decompiled.for != path) decompiled = { status: 0 };
    if (decompiled.status == 2) $editorContents = decompiled.data;
    else $editorContents = rawFile;
  }
</script>

<div class="flex min-w-0 flex-grow flex-col">
  <div class="flex items-center bg-neutral-800 p-4">
    <p class="min-w-0 overflow-hidden font-mono">{path}</p>
    <Button
      styling="inline-block p-2 mx-2 ml-auto"
      on:click={() => {
        const file = new File([rawFile], path.split("/").at(-1), {
          type: path.endsWith(".class") ? "application/java-vm" : "text/plain",
        });
        const url = window.URL.createObjectURL(file);
        const link = document.createElement("a");
        link.setAttribute("download", path.split("/").at(-1));
        link.setAttribute("href", url);
        document.head.appendChild(link);
        link.click();
        link.remove();
      }}
    >
      <Icon icon={save} />
    </Button>
    <Button
      styling="p-2 mx-2"
      on:click={async () => {
        if (decompiled.status == 0) {
          decompiled = { status: 1 };
          const fileBuffer = await zip.files[path].async("arraybuffer");
          try {
            const decomped = await decompile(rawFile, fileBuffer, path);
            decompiled = { status: 2, data: decomped, for: path };
          } catch (e) {
            decompiled = { status: 3 };
          }
        } else if (decompiled.status == 1) return;
        else {
          decompiled.status = 0;
        }
      }}
      disabled={decompiled.status == 1}
    >
      {#if decompiled.status == 0}
        <Icon icon={java} />
      {:else if decompiled.status == 1}
        <Icon icon={cloudLoad} />
      {:else}
        {#if decompiled.status == 3}
          Failed
        {/if}
        <Icon icon={fileRestore} />
      {/if}
    </Button>
    <Button styling="p-2 mx-2" on:click={() => (path = null)}>
      <Icon icon={close} />
    </Button>
  </div>
  <Monaco bind:content={editorContents} />
</div>
