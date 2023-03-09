<script>
  import { Button, Card, Divider } from "m3-svelte";
  import { getContext } from "svelte";
  import { createAnalysis } from "./createAnalysis";
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
<p class="italic">RatRater is not ready to be used yet!</p>
<!-- <div class="grid gap-4 lg:grid-cols-4 2xl:grid-cols-6">
  {#each [1, 2, 3, 4, 5, 6] as i}
    <div class="flex flex-col items-center rounded-xl bg-primary/5 p-4">
      <h2 class="m3-font-headline-small">Uses session token</h2>
      <p class="mt-2">3 files</p>
      <div class="my-4 w-full">
        <Divider verticalSpace={false} />
      </div>
      <div class="flex justify-center gap-2">
        <Button type="text">View files</Button>
        <Button type="tonal">Flag info</Button>
      </div>
    </div>
  {/each}
</div> -->
