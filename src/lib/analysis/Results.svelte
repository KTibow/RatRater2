<script lang="ts">
  import { Icon } from "m3-svelte";
  import iconWarning from "@ktibow/iconset-ic/outline-warning";
  import iconCheck from "@ktibow/iconset-ic/outline-check";
  import iconNo from "@ktibow/iconset-ic/outline-block";
  import iconUnknown from "@ktibow/iconset-ic/outline-help-outline";
  import iconSearch from "@ktibow/iconset-ic/outline-search";
  import iconObf from "@ktibow/iconset-ic/outline-lens-blur";
  import iconRat from "@ktibow/iconset-ic/outline-pest-control-rodent";

  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { file, view, type Loaded } from "$lib/state";
  import { createAnalysis, type Analysis, type Progress } from "./createAnalysis";
  import { scanWebhooks } from "./webhook";

  import { Button, Layer } from "m3-svelte";
  import ObfuscationTable from "./ObfuscationTable.svelte";
  import FlagCard from "./FlagCard.svelte";

  type OfficialHash = { file: string; hash: string; source: string; time: number };
  const officialHashes: Writable<OfficialHash[]> = getContext("hashes");
  let officialFile: OfficialHash | undefined,
    officialName: OfficialHash | undefined,
    impersonating: string | undefined;
  $: if ($officialHashes) {
    officialFile = $officialHashes.find((h) => h.hash == ($file as Loaded).hash);
    officialName = $officialHashes.find((h) => h.file == ($file as Loaded).file.name);
    impersonating =
      officialName && !(officialFile && officialFile.hash == officialName.hash)
        ? officialName.file
        : undefined;
  }

  let analysis: Writable<Analysis>;
  let progress: Writable<Progress>;
  let webhooks: Set<string> | undefined;
  let webhooksNuked = false;
  $: if ("zip" in $file) {
    ({ analysis, progress } = createAnalysis());
    webhooks = undefined;
    webhooksNuked = false;
  }
  $: obfuscation = Object.entries($analysis.obfuscation);

  const getWebhooks = async () => {
    webhooks = await scanWebhooks();
  };
  const nukeWebhooks = async () => {
    const message = `⛔ Access Revoked: Your webhook has been shut down for not adhering to the [Terms of Service](https://discord.com/terms). We have recorded your account information, and immediate discontinuation of these violations is required to avoid further action.`;

    // @ts-expect-error
    for (const webhook of webhooks) {
      // wtf discord made webhooks work over CORS
      const resp = await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
        }),
      });
      if (resp.status != 404) {
        fetch(webhook, {
          method: "DELETE",
        });
      }
    }
    webhooksNuked = true;
  };
</script>

<div class="flex flex-wrap gap-2">
  {#if !$officialHashes}
    <div class="info-layout">
      <Icon icon={iconWarning} />
      We couldn't load official mods
    </div>
  {:else if officialFile}
    <div class="info-layout">
      <Icon icon={iconCheck} />
      Found in official sources like {officialFile.source}
    </div>
  {:else if impersonating}
    <div class="info-layout">
      <Icon icon={iconNo} />
      Might be impersonating the real {impersonating}
    </div>
  {:else}
    <div class="info-layout">
      <Icon icon={iconUnknown} />
      We haven't seen this file
    </div>
  {/if}
  <div class="info-layout">
    <Icon icon={iconSearch} />
    {#if !$progress}
      Starting scan...
    {:else if $progress.total == 0}
      No checkable files
    {:else}
      {Math.floor(($progress.done / $progress.total) * 100)}% done
    {/if}
  </div>
  {#if $analysis.flagged}
    {@const flag = $analysis.flagged}
    <div class="info-layout overflow-hidden border-2 border-tertiary">
      <Icon icon={iconRat} />
      It's a {flag.name} rat
      {#if flag.file}
        <button
          class="underline-hover text-primary underline"
          on:click={() => ($view = { tab: "browser", editorFile: flag.file })}
        >
          <span class="font-mono">{flag.file.replace(/.+\//, "../")}</span>
        </button>
      {:else}
        <p>checked in the cloud</p>
      {/if}
    </div>
  {/if}
  {#if !officialFile && !$analysis.flagged && obfuscation?.length > 0}
    <div class="info-layout">
      <Icon icon={iconObf} />
      Possible obfuscation
    </div>
  {/if}
</div>
<div class="grid gap-4 x:grid-cols-2 l:grid-cols-4 xl:grid-cols-6">
  {#each Object.entries($analysis.flags) as [name, flag]}
    <FlagCard {name} {flag} />
  {/each}
  {#if obfuscation?.length > 0}
    <div
      class="flex flex-col items-center gap-4 overflow-hidden rounded-sm bg-primary-container p-4 text-on-primary-container"
    >
      <h2 class="m3-font-title-large">Obfuscation</h2>
      <ObfuscationTable {obfuscation} />
    </div>
  {/if}
  {#if webhooks}
    <div
      class="flex flex-col items-center gap-4 overflow-hidden rounded-sm bg-primary-container p-4 text-on-primary-container"
    >
      <h2 class="m3-font-title-large">Webhooks</h2>
      {#if webhooks.size > 0}
        {#if webhooksNuked}
          <p>Webhooks have been nuked</p>
        {:else}
          {#each webhooks as webhook}
            <a href={webhook} target="_blank">{webhook}</a>
          {/each}
          <Button variant="text" onclick={nukeWebhooks}>Nuke webhooks</Button>
        {/if}
      {/if}
    </div>
  {:else}
    <button
      class="relative rounded-sm bg-primary-container px-4 py-8 text-on-primary-container m3-font-title-large"
      on:click={getWebhooks}
    >
      <Layer />
      Scan for webhooks
    </button>
  {/if}
</div>

<style lang="postcss">
  .info-layout {
    display: flex;
    flex-direction: column;
    background-color: rgb(var(--m3-scheme-background));

    width: 10rem;
    height: 10rem;
    padding: 1rem;
    border-radius: 1.5rem;
    transition: all 150ms;
  }
  .info-layout :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    margin-bottom: auto;
  }
</style>
