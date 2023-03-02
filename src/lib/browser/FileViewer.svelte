<script>
  import iconExtract from "@iconify-icons/ic/outline-unarchive";
  import iconCode from "@iconify-icons/ic/outline-code";
  import iconArrowDown from "@iconify-icons/ic/outline-expand-more";
  import { Chip } from "m3-svelte";
  import Monaco from "./Monaco.svelte";
  /**
   * @type {import("jszip")}
   */
  export let zip;
  export let openFile;
  let content, showingDecompiled;
  $: (async () => {
    const file = zip.files[openFile];
    if (!file || !content) return;
    if (showingDecompiled) return; // TODO
    $content = await file.async("string");
  })();
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
    <Chip type="assist" icon={iconCode} trailingIcon={iconArrowDown}>Decompile</Chip>
  </div>
</div>
