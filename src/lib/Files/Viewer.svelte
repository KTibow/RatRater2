<script>
  import Monaco from "./Monaco.svelte";
  import { tick } from "svelte";
  import Icon from "@iconify/svelte";
  import save from "@iconify-icons/mdi/content-save";
  import copy from "@iconify-icons/mdi/clipboard";
  import close from "@iconify-icons/mdi/close";
  import Button from "../Button.svelte";

  export let zip;
  export let path;
  let rawFile;
  let mode;

  let editorContents;
  $: {
    if (!zip || !path) break $;
    zip.files[path].async("text").then((data) => (rawFile = data));
  }
  $: {
    if (!editorContents || !rawFile) break $;
    $editorContents = rawFile;
  }
</script>

<div class="flex flex-grow flex-col">
  <div class="flex items-center bg-neutral-800 p-4">
    <div>
      <p class="font-mono">{path}</p>
    </div>
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
    <Button styling="inline-block p-2 mx-2"><Icon icon={copy} /></Button>
    <Button styling="inline-block p-2 mx-2" on:click={() => (path = null)}>
      <Icon icon={close} />
    </Button>
  </div>
  <Monaco bind:content={editorContents} />
</div>
