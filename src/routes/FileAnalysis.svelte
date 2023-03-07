<script>
  import { Card, LinearProgress } from "m3-svelte";
  import Icon from "@iconify/svelte";
  import iconLoading from "@iconify-icons/ic/outline-pending-actions";
  import AnalysisTable from "$lib/analysis/AnalysisTable.svelte";
  import Results from "$lib/analysis/Results.svelte";

  export let currentFile;
  export let loading;

  let hash;
  const updateHash = async () => {
    hash = null;
    const hashBytes = await crypto.subtle.digest("SHA-256", loading.data);
    hash = [...new Uint8Array(hashBytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };
  $: loading.data, updateHash();
  let progress;
</script>

{#if hash}
  <Card type="elevated">
    <div class="flex flex-col lg:flex-row">
      <p class="flex-1 font-mono">{currentFile.name}</p>
      <AnalysisTable size={currentFile.size} {hash} comment={loading.zip.comment} />
    </div>
    {#if progress}
      <div class="progress -m-4 mt-2 flex">
        <LinearProgress percent={($progress.done / $progress.total) * 100} />
      </div>
    {/if}
  </Card>
  <div class="h-4" />
  <Results zip={loading.zip} {hash} bind:progress on:open />
{:else}
  <div class="m-auto flex flex-col items-center gap-4 rounded-2xl bg-primary/10 p-6">
    <Icon icon={iconLoading} height={24} />
    <p class="m3-font-headline-small">Hashing file...</p>
  </div>
{/if}

<style>
  .progress > :global(div) {
    width: 100%;
  }
</style>
