<script>
  import FileTree from "$lib/browser/FileTree.svelte";
  import { getFileTree } from "$lib/browser/tree";
  import FileViewer from "$lib/browser/FileViewer.svelte";

  export let loading;
  export let openFile;
  $: fileList = Object.keys(loading.zip.files);
</script>

<div class="flex h-full max-lg:flex-col" class:pb-8={openFile}>
  <div
    class="group shrink-0 overflow-auto rounded-md p-2 outline outline-2 outline-outline max-lg:h-[25vh] lg:w-1/4"
    class:custom-open-file={openFile}
  >
    <FileTree nodes={getFileTree(fileList)} on:open={(e) => (openFile = e.detail)} />
  </div>
  {#if openFile}
    <FileViewer zip={loading.zip} {openFile} />
  {/if}
</div>

<style lang="postcss">
  .custom-open-file {
    @apply max-lg:rounded-b-none lg:rounded-r-none;
  }
</style>
