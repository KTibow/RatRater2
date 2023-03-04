<script>
  import iconExtract from "@iconify-icons/ic/outline-unarchive";
  import { Chip } from "m3-svelte";
  import Monaco from "./Monaco.svelte";
  import Decompile from "./Decompile.svelte";
  /**
   * @type {import("jszip")}
   */
  export let zip;
  export let openFile;
  let rawContent, decompiled, content;
  $: {
    const file = zip.files[openFile];
    if (!openFile.endsWith(".class")) decompiled = false;
    if (file) file.async("string").then((c) => (rawContent = c));
  }
  $: if (content && rawContent) $content = decompiled || rawContent;
  const downloadFile = async () => {
    const file = zip.files[openFile];
    if (!file) return console.error("could not find file");
    const fileBlob = await file.async("blob");
    const fileUrl = URL.createObjectURL(fileBlob);

    const link = document.createElement("a");
    link.setAttribute("download", openFile.split("/").at(-1));
    link.setAttribute("href", fileUrl);
    document.head.appendChild(link);
    link.click();
    link.remove();
  };
</script>

<div class="relative flex-grow">
  <Monaco bind:content />
  <div class="absolute top-full flex w-full items-center gap-2 p-1">
    <span class="mr-auto flex-1 overflow-hidden text-ellipsis font-mono">{openFile}</span>
    <Chip type="assist" on:click={downloadFile} icon={iconExtract}>Grab</Chip>
    {#if openFile.endsWith(".class")}
      <Decompile bind:decompiled {rawContent} {zip} {openFile} />
    {/if}
  </div>
</div>
