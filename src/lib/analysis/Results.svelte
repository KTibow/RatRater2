<script>
  import { createAnalysis } from "./createAnalysis";
  import ObfuscationNote from "./ObfuscationNote.svelte";

  export let zip;
  export let hash;
  export let progress;
  let analysis;
  $: ({ analysis, progress } = createAnalysis({ zip, hash }));
</script>

{#if $analysis.obfuscation.length}
  <ObfuscationNote data={$analysis.obfuscation} on:open />
  <div class="h-4" />
{/if}
