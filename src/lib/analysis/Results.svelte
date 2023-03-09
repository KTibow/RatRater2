<script>
  import { getContext } from "svelte";
  import { createAnalysis } from "./createAnalysis";
  import ObfuscationNote from "./ObfuscationNote.svelte";

  export let zip;
  export let hash;
  export let progress;
  let analysis;
  $: ({ analysis, progress } = createAnalysis({ zip, hash }));
  const officialHashes = getContext("hashes");
  $: status = $analysis.flagged
    ? "rat"
    : $officialHashes
    ? $officialHashes.some((h) => hash == h.hash)
      ? "safe"
      : "none"
    : "fail";
</script>

{#if $analysis.obfuscation.length}
  <ObfuscationNote data={$analysis.obfuscation} on:open />
  <div class="h-4" />
{/if}
<div class="h-2" />
<div class="overflow-hidden rounded-lg bg-primary-container p-4 text-on-primary-container">
  {#if status == "fail"}
    <p>
      This file doesn't have any obvious flags, but RatRater couldn't get the list of official mods.
    </p>
  {:else if status == "rat"}
    <p>This file is almost definitely a rat. TODO: actually get $analysis.flagged</p>
  {:else if status == "safe"}
    {@const hash = $officialHashes.find((h) => hash == h.hash)}
    <details>
      <summary class="-m-4 cursor-pointer p-4"> This file was found in official sources. </summary>
      <p class="my-2">
        RatRater automatically grabs mods from official sources. This file's contents are identical
        to an officially released one:
      </p>
      <table class="w-full">
        <tr>
          <td class="border-r border-primary pr-2">File</td>
          <td class="border-r border-primary px-2">Source</td>
          <td class="pl-2">Added</td>
        </tr>
        <tr>
          <td class="border-r border-primary pr-2">{hash.file}</td>
          <td class="border-r border-primary px-2">{hash.source}</td>
          <td class="pl-2">{new Date(hash.time).toLocaleString()}</td>
        </tr>
      </table>
    </details>
  {:else if status == "none"}
    <p>
      This file doesn't have any obvious flags, and RatRater hasn't found it in official sources.
      Consider asking in <a href="https://discord.gg/7sBMTv7AF3">Vanta</a> or using other parts of RatRater.
    </p>
  {/if}
</div>
