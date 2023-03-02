<script>
  import FileTree from "$lib/browser/FileTree.svelte";
  import { getFileTree } from "$lib/browser/tree";
  import FileViewer from "$lib/browser/FileViewer.svelte";

  export let loading;
  export let openFile;
  $: fileList = Object.keys(loading.zip.files);
</script>

<div class="flex h-full pb-8">
  <div
    class="group w-1/4 overflow-auto rounded-md p-2 outline outline-2 outline-outline"
    class:rounded-r-none={openFile}
  >
    <FileTree nodes={getFileTree(fileList)} on:open={(e) => (openFile = e.detail)} />
  </div>
  {#if openFile}
    <FileViewer zip={loading.zip} {openFile} />
  {/if}
</div>
