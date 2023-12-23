<script lang="ts">
  import { file, view } from "$lib/state";
  import FileTree from "./FileTree.svelte";
  import FileViewer from "./FileViewer.svelte";
  import { getFileTree } from "./tree";

  $: fileList = "zip" in $file && Object.keys($file.zip.files);
</script>

{#if fileList}
  <div class="panes flex grow overflow-hidden" class:file-open={$view.editorFile}>
    <div class="tree-pane group overflow-auto p-4 sm:px-6">
      <FileTree nodes={getFileTree(fileList)} on:chosen={(e) => ($view.editorFile = e.detail)} />
    </div>
    {#if $view.editorFile}
      <div class="viewer-pane flex-col">
        <FileViewer />
      </div>
    {/if}
  </div>
{/if}

<style>
  @media (max-width: 1024px) {
    .panes {
      flex-direction: column;
    }
    .tree-pane,
    .viewer-pane {
      flex-grow: 1;
    }
    .viewer-pane {
      display: none;
    }
    .file-open > .tree-pane {
      display: none;
    }
    .file-open > .viewer-pane {
      display: flex;
    }
  }
  @media (min-width: 1024px) {
    .panes {
      padding: 1rem 1.5rem;
      gap: 1.5rem;
      --m3-util-bottom-offset: 1rem;
    }
    .tree-pane {
      font-family: monospace;
      min-width: 30ch;
      width: 25vw;
      max-width: 50ch;

      background-color: rgb(var(--m3-scheme-background));
      padding: 1rem;
      border-radius: 1rem;
    }
    .viewer-pane {
      display: flex;
      flex-grow: 1;

      background-color: rgb(var(--m3-scheme-background));
      border-radius: 1rem;
    }
  }
</style>
