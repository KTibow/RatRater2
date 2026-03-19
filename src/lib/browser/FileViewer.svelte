<script lang="ts">
  import { BlobWriter, TextWriter, type FileEntry } from "@zip.js/zip.js";
  import { Icon } from "m3-svelte";
  import iconClose from "@ktibow/iconset-ic/outline-close";
  import iconExtract from "@ktibow/iconset-ic/outline-unarchive";
  import type { Writable } from "svelte/store";
  import { Button } from "m3-svelte";

  import { arrayBufferToBinaryString } from "$lib/binaryString";
  import { file, view, type Loaded } from "$lib/state";
  import { isClassPath, stripTrailingSlash, type LoadedEntry } from "$lib/zipEntries";
  import Decompile from "./Decompile.svelte";
  import Monaco from "./Monaco.svelte";

  const goBack = () => {
    $view = { tab: "browser" };
  };
  const getEntry = (path: string): LoadedEntry | undefined =>
    ($file as Loaded).entries.find(
      (entry) => entry.filename === path || entry.filename === "/" + path,
    );
  const readEntryContent = async (entry: LoadedEntry, path: string) => {
    if (isClassPath(path)) {
      return arrayBufferToBinaryString(await entry.arrayBuffer());
    }
    return entry.getData(new TextWriter());
  };
  const downloadFile = async () => {
    const editorFile = $view.editorFile as string;
    const fileEntry = getEntry(editorFile);
    if (!fileEntry) return console.error("could not find file");
    const fileBlob = await fileEntry.getData(new BlobWriter());
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
      const trimmedPath = stripTrailingSlash(path);
      const suffix = path.endsWith("/") ? "/" : "";
      let lastIndex = trimmedPath.lastIndexOf("/");
      splitPath = {
        start: trimmedPath.substring(0, lastIndex) || "/",
        end: trimmedPath.substring(lastIndex + 1) + suffix,
      };
    }
  }

  let content: Writable<string> | undefined;
  let rawContent: string | undefined, decompiled: string | undefined;
  $: {
    const path = $view.editorFile;
    const hasEntries = "entries" in $file;
    if (!path || !hasEntries) break $;

    const fileEntry = getEntry(path);
    if (!isClassPath(path)) decompiled = undefined;
    rawContent = undefined;
    if (fileEntry) {
      const pinnedPath = path;
      readEntryContent(fileEntry, path).then((content) => {
        if ($view.editorFile === pinnedPath) rawContent = content;
      });
    }
  }
  $: if (content && rawContent != undefined) $content = decompiled || rawContent;
</script>

<div class="flex items-center gap-4 p-4">
  <div class="mr-auto">
    <p class="m3-font-title-medium">{splitPath.end}</p>
    <p class="m3-font-body-medium text-on-surface-variant">{splitPath.start}</p>
  </div>
  <div class="flex l:hidden">
    <Button variant="text" iconType="full" onclick={goBack}><Icon icon={iconClose} /></Button>
  </div>
  <Button variant="text" iconType="full" onclick={downloadFile}><Icon icon={iconExtract} /></Button>
  {#if $view.editorFile && isClassPath($view.editorFile)}
    <Decompile contentIn={rawContent} bind:contentOut={decompiled} />
  {/if}
</div>
<Monaco bind:content />
