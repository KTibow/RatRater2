<script lang="ts">
  import iconExtract from "@iconify-icons/ic/outline-unarchive";
  import type { Writable } from "svelte/store";
  import { Chip } from "m3-svelte";
  import { file, type Loaded, view } from "$lib/state";
  import Monaco from "./Monaco.svelte";
  import Decompile from "./Decompile.svelte";

  let content: Writable<string> | undefined;
  let rawContent: string, decompiled: string | undefined;

  $: editorFile = $view.editorFile as string;
  $: {
    const files = ($file as Loaded).zip.files;
    const fileZip = files[editorFile] || files["/" + editorFile];
    if (!editorFile.endsWith(".class")) decompiled = undefined;
    if (fileZip) fileZip.async("string").then((c) => (rawContent = c));
  }
  $: if (content && rawContent) $content = decompiled || rawContent;
  const downloadFile = async () => {
    const fileZip = ($file as Loaded).zip.files[editorFile];
    if (!fileZip) return console.error("could not find file");
    const fileBlob = await fileZip.async("blob");
    const fileUrl = URL.createObjectURL(fileBlob);

    const link = document.createElement("a");
    link.setAttribute("download", editorFile.split("/").at(-1) as string);
    link.setAttribute("href", fileUrl);
    document.head.appendChild(link);
    link.click();
    link.remove();
  };
</script>

<div class="relative flex-grow">
  <Monaco bind:content />
  <div class="absolute top-full flex w-full items-center gap-2 p-1">
    <span class="mr-auto flex-1 overflow-hidden text-ellipsis font-mono">{editorFile}</span>
    <Chip type="assist" on:click={downloadFile} icon={iconExtract}>Grab</Chip>
    {#if editorFile.endsWith(".class")}
      <Decompile bind:contentOut={decompiled} contentIn={rawContent} />
    {/if}
  </div>
</div>
