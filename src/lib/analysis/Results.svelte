<script>
  import { LinearProgress } from "m3-svelte";
  import { createAnalysis } from "./createAnalysis";
  import ObfuscationNote from "./ObfuscationNote.svelte";

  export let zip;
  export let hash;
  let analysis, progress;
  $: ({ analysis, progress } = createAnalysis({ zip, hash }));
</script>

{#if $progress.done < $progress.total}
  <p>
    Analyzing {$progress.total} files
  </p>
  <LinearProgress percent={$progress.done / $progress.total} />
  <div class="h-4" />
{/if}
{#if $analysis.obfuscation.length}
  <ObfuscationNote data={$analysis.obfuscation} on:open />
  <div class="h-4" />
{/if}
