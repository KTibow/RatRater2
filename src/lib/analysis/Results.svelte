<script>
  import { getContext } from "svelte";
  import { createAnalysis } from "./createAnalysis";
  import FlagCard from "./FlagCard.svelte";
  import ObfuscationNote from "./ObfuscationNote.svelte";
  import SafeNote from "./SafeNote.svelte";

  export let zip;
  export let hash;
  export let progress;
  const officialHashes = getContext("hashes");

  let analysis;
  $: ({ analysis, progress } = createAnalysis({ zip, hash }));
</script>

{#if Object.keys($analysis.obfuscation).length}
  <ObfuscationNote data={$analysis.obfuscation} on:open />
  <div class="h-6" />
{/if}
<SafeNote
  flag={$analysis.flagged}
  hash={$officialHashes ? $officialHashes.find((h) => h.hash == hash) : "error"}
/>
<div class="grid gap-4 lg:grid-cols-4 2xl:grid-cols-6">
  {#each $analysis.flags as flag}
    <FlagCard {...flag} on:open />
  {/each}
</div>
