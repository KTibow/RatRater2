<script lang="ts">
  import { file, view } from "$lib/state";
  import FileTree from "./FileTree.svelte";
  import FileViewer from "./FileViewer.svelte";
  import { getFileTree } from "./tree";

  $: fileList = "zip" in $file && Object.keys($file.zip.files);
</script>

<div
  class="flex flex-1 basis-0 overflow-hidden p-6 max-lg:flex-col"
  class:file-open={$view.editorFile}
>
  {#if fileList}
    <div class="tree group shrink-0 overflow-auto rounded-xl p-2">
      <FileTree nodes={getFileTree(fileList)} on:chosen={(e) => ($view.editorFile = e.detail)} />
    </div>
    {#if $view.editorFile}
      <FileViewer />
    {/if}
  {/if}
</div>

<style lang="postcss">
  .file-open {
    @apply pb-14;
  }
  .tree {
    @apply h-[25vh] bg-primary-container/50 lg:h-auto lg:w-1/4;
  }
  .file-open .tree {
    @apply max-lg:rounded-b-none lg:rounded-r-none;
  }
</style>
