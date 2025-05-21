<script lang="ts">
  import Icon from "@iconify/svelte";
  import iconClose from "@ktibow/iconset-ic/outline-close";
  import iconExtract from "@ktibow/iconset-ic/outline-unarchive";
  import type { Writable } from "svelte/store";
  import { Button } from "m3-svelte";

  import { file, view, type Loaded } from "$lib/state";
  import Decompile from "./Decompile.svelte";
  import Monaco from "./Monaco.svelte";

  const goBack = () => {
    $view = { tab: "browser" };
  };
  const downloadFile = async () => {
    const editorFile = $view.editorFile as string;
    const fileZip = ($file as Loaded).zip.files[editorFile];
    if (!fileZip) return console.error("could not find file");
    const fileBlob = await fileZip.async("blob");
    const fileUrl = URL.createObjectURL(fileBlob);

    const link = document.createElement("a");
    link.setAttribute("download", splitPath.end);
    link.setAttribute("href", fileUrl);
    document.head.appendChild(link);
    link.click();
    link.remove();
  };

  let splitPath = { start: "", end: "" };
  $: {
    const path = $view.editorFile;
    if (path) {
      let lastIndex = path.lastIndexOf("/");
      splitPath = {
        start: path.substring(0, lastIndex) || "/",
        end: path.substring(lastIndex + 1),
      };
    }
  }

  let content: Writable<string> | undefined;
  let rawContent: string | undefined, decompiled: string | undefined;
  $: {
    const path = $view.editorFile;
    const hasZip = "zip" in $file;
    if (!path || !hasZip) break $;

    const files = ($file as Loaded).zip.files;
    const fileZip = files[path] || files["/" + path];
    if (!path.endsWith(".class")) decompiled = undefined;
    if (fileZip) fileZip.async("string").then((c) => (rawContent = c));
  }
  $: if (content && rawContent != undefined) $content = decompiled || rawContent;
</script>

<div class="flex items-center gap-4 p-4">
  <div class="mr-auto">
    <p class="m3-font-title-medium">{splitPath.end}</p>
    <p class="m3-font-body-medium text-on-surface-variant">{splitPath.start}</p>
  </div>
  <div class="flex lg:hidden">
    <Button variant="text" iconType="full" click={goBack}><Icon icon={iconClose} /></Button>
  </div>
  <Button variant="text" iconType="full" click={downloadFile}><Icon icon={iconExtract} /></Button>
  {#if $view.editorFile && $view.editorFile.endsWith(".class")}
    <Decompile contentIn={rawContent} bind:contentOut={decompiled} />
  {/if}
</div>
<Monaco bind:content />
