<script>
  import Monaco from "./Monaco.svelte";
  import { tick } from "svelte";
  import Icon from "@iconify/svelte";
  import save from "@iconify-icons/mdi/content-save";
  import copy from "@iconify-icons/mdi/clipboard";
  import close from "@iconify-icons/mdi/close";

  export let zip;
  export let path;
  let contents;
  let editorContents;
  $: {
    if (!zip || !path) break $;
    zip.files[path].async("text").then((data) => (contents = data));
  }
  $: {
    if (!editorContents || !contents) break $;
    $editorContents = contents;
  }
</script>

<div class="flex flex-grow flex-col">
  <div class="flex bg-neutral-800 p-4">
    <div>
      <p class="font-mono">{path}</p>
      <button class="rounded-md bg-blue-500/40 p-2 transition-all hover:bg-blue-500/60">
        <Icon icon={save} />
      </button>
      <button class="rounded-md bg-blue-500/40 p-2 transition-all hover:bg-blue-500/60">
        <Icon icon={copy} />
      </button>
    </div>

    <button class="ml-auto rounded-md bg-blue-500/40 p-2 transition-all hover:bg-blue-500/60">
      <Icon icon={close} />
    </button>
  </div>
  <Monaco bind:content={editorContents} />
</div>
