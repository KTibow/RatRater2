<script>
  import { Divider } from "m3-svelte";
  import { getContext } from "svelte";
  import { createAnalysis } from "./createAnalysis";
  import FlagCard from "./FlagCard.svelte";
  import ObfuscationNote from "./ObfuscationNote.svelte";
  import SafeNote from "./SafeNote.svelte";

  export let zip;
  export let hash;
  export let progress;
  let analysis;
  $: ({ analysis, progress } = createAnalysis({ zip, hash }));
  const officialHashes = getContext("hashes");
</script>

{#if $analysis.obfuscation.length}
  <ObfuscationNote data={$analysis.obfuscation} on:open />
  <div class="h-6" />
{/if}
<SafeNote
  flag={$analysis.flagged}
  hash={$officialHashes ? $officialHashes.find((h) => h.hash == hash) : "error"}
/>
<div class="my-10">
  <Divider verticalSpace={false} />
</div>
<div class="grid gap-4 lg:grid-cols-4 2xl:grid-cols-6">
  {#each $analysis.flags as flag}
    <FlagCard name={flag.name} files={flag.matches} infoLink={flag.link} on:open />
  {/each}
</div>
