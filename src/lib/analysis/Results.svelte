<script>
  import { getContext } from "svelte";
  import { createAnalysis } from "./createAnalysis";
  import ObfuscationTable from "./ObfuscationTable.svelte";
  import FlagCard from "./FlagCard.svelte";

  export let zip;
  export let hash;
  export let progress;
  const officialHashes = getContext("hashes");

  let analysis;
  $: ({ analysis, progress } = createAnalysis({ zip, hash }));
  let obfuscation;
  $: if ($analysis) obfuscation = Object.entries($analysis.obfuscation);
</script>

<div class="mb-6 flex gap-4 max-lg:flex-col">
  <div class="info-layout flex-1 rounded-2xl bg-primary/10">
    <p class="m3-font-headline-small">
      {#if !$progress}
        Starting scan...
      {:else if $progress.total == 0}
        No checkable files
      {:else}
        {Math.floor(($progress.done / $progress.total) * 100)}% done
      {/if}
    </p>
  </div>
  {#if obfuscation && obfuscation.length}
    <div class="info-layout flex-1 rounded-2xl bg-primary/10">
      <p class="m3-font-headline-small">Possible obfuscation</p>
      <ObfuscationTable {obfuscation} on:open />
    </div>
  {/if}
  {#if $analysis.flagged || !$officialHashes || $officialHashes.find((h) => h.hash == hash)}
    <div class="info-layout flex-1 rounded-2xl bg-primary/10">
      {#if $analysis.flagged}
        <p class="m3-font-headline-small text-center">
          Almost definitely a rat<br />
          TODO: show flag
        </p>
      {:else if !$officialHashes}
        <p class="m3-font-headline-small text-center">Failed to load official hashes</p>
      {:else}
        {@const hash = $officialHashes.find((h) => h.hash == hash)}
        <p class="m3-font-headline-small text-center">Found in official sources</p>
        <table class="w-full">
          <tr>
            <th class="border-r border-outline pr-2">File</th>
            <td class="pl-2">{hash.file}</td>
          </tr>
          <tr>
            <th class="border-r border-outline pr-2">Source</th>
            <td class="pl-2">{hash.source}</td>
          </tr>
          <tr>
            <th class="border-r border-outline pr-2">Added</th>
            <td class="pl-2">{new Date(hash.time).toLocaleString()}</td>
          </tr>
        </table>
      {/if}
    </div>
  {/if}
</div>
<div class="grid gap-4 lg:grid-cols-4 2xl:grid-cols-6">
  {#each Object.entries($analysis.flags) as [flag, data]}
    <FlagCard name={flag} {...data} on:open />
  {/each}
</div>

<style lang="postcss">
  .info-layout {
    @apply flex flex-col items-center justify-center p-4;
  }
</style>
