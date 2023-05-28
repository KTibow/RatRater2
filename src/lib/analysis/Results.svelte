<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { file, type Loaded } from "$lib/state";
  import { createAnalysis, type Analysis, type Progress, type Obfuscation } from "./createAnalysis";
  import ObfuscationTable from "./ObfuscationTable.svelte";
  import FlagCard from "./FlagCard.svelte";

  const officialHashes: Writable<{ file: string; hash: string; source: string; time: number }[]> =
    getContext("hashes");
  $: officialFile = $officialHashes.find((h) => h.hash == ($file as Loaded).hash);
  const dispatch = createEventDispatcher();

  let analysis: Writable<Analysis>;
  let progress: Writable<Progress>;
  $: ({ analysis, progress } = createAnalysis());
  let obfuscation: Obfuscation;
  $: obfuscation = Object.entries($analysis.obfuscation);
</script>

<div class="flex gap-4 max-lg:flex-col">
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
  {#if $analysis.flagged || !$officialHashes || officialFile}
    <div
      class="info-layout flex-1 rounded-2xl border-primary bg-primary/10"
      class:border-4={$analysis.flagged}
    >
      {#if $analysis.flagged}
        {@const flag = $analysis.flagged}
        <p class="m3-font-headline-small text-center">Almost definitely a rat</p>
        <p class="text-center">Classification: {flag.name}</p>
        <button
          class="underline-hover truncate text-primary underline"
          on:click={() => dispatch("open", flag.file)}
        >
          File: <span class="font-mono">{flag.file}</span>
        </button>
      {:else if !$officialHashes}
        <p class="m3-font-headline-small text-center">Failed to load official hashes</p>
      {:else if officialFile}
        <p class="m3-font-headline-small text-center">Found in official sources</p>
        <table class="w-full">
          <tr>
            <th class="border-r border-outline pr-2">File</th>
            <td class="pl-2">{officialFile.file}</td>
          </tr>
          <tr>
            <th class="border-r border-outline pr-2">Source</th>
            <td class="pl-2">{officialFile.source}</td>
          </tr>
          <tr>
            <th class="border-r border-outline pr-2">Added</th>
            <td class="pl-2">{new Date(officialFile.time).toLocaleString()}</td>
          </tr>
        </table>
      {/if}
    </div>
  {/if}
</div>
<div class="grid gap-4 lg:grid-cols-4 2xl:grid-cols-6">
  {#each Object.entries($analysis.flags) as [name, flag]}
    <FlagCard {name} {flag} on:open />
  {/each}
</div>

<style lang="postcss">
  .info-layout {
    @apply flex flex-col items-center justify-center overflow-hidden p-4;
  }
</style>
