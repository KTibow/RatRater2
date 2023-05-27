<script>
  import FileTree from "./FileTree.svelte";
  import FileViewer from "./FileViewer.svelte";
  import { getFileTree } from "./tree";

  export let loading;
  export let openFile;
  $: fileList = Object.keys(loading.zip.files);
</script>

<div class="flex h-full max-lg:flex-col" class:pb-8={openFile}>
  <div class="tree group shrink-0 overflow-auto rounded-xl p-2" class:custom-open-file={openFile}>
    <FileTree nodes={getFileTree(fileList)} on:open={(e) => (openFile = e.detail)} />
  </div>
  {#if openFile}
    <FileViewer zip={loading.zip} {openFile} />
  {/if}
</div>

<style lang="postcss">
  .tree {
    @apply h-[25vh] bg-primary-container/50 lg:h-auto lg:w-1/4;
  }
  .custom-open-file {
    @apply max-lg:rounded-b-none lg:rounded-r-none;
  }
</style>
