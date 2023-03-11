<script>
  import { Divider, enterExit, FAB, Menu, TextField } from "m3-svelte";
  import iconLibraryCheck from "@iconify-icons/ic/outline-library-add-check";
  import iconHistory from "@iconify-icons/ic/outline-history";
  import iconBuild from "@iconify-icons/ic/outline-build";
  import { getContext } from "svelte";
  import { createAnalysis } from "./createAnalysis";
  import FlagCard from "./FlagCard.svelte";
  import ObfuscationNote from "./ObfuscationNote.svelte";
  import SafeNote from "./SafeNote.svelte";

  export let zip;
  export let hash;
  export let progress;
  const officialHashes = getContext("hashes");

  const flagConfigs = [
    { id: "recommended", name: "Recommended flags", icon: iconLibraryCheck },
    { id: "legacy", name: "Legacy flags", icon: iconHistory },
    { id: "custom", name: "Custom flags", icon: iconBuild },
  ];
  let flagConfig = "recommended";
  let flagConfigContainer;
  let flagConfigOpen = false;
  function clickOutside() {
    const handleClick = (event) => {
      if (!flagConfigContainer.contains(event.target)) {
        flagConfigOpen = false;
      }
    };
    document.addEventListener("click", handleClick, true);
    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }
  let obfFlagsSource, mainFlagsSource;

  let analysis;
  $: ({ analysis, progress } = createAnalysis({ zip, hash, flagConfig }));
</script>

{#if $analysis.obfuscation.length}
  <ObfuscationNote data={$analysis.obfuscation} on:open />
  <div class="h-6" />
{/if}
<SafeNote
  flag={$analysis.flagged}
  hash={$officialHashes ? $officialHashes.find((h) => h.hash == hash) : "error"}
/>
<div class="relative my-10">
  <Divider verticalSpace={false} />
  <span class="absolute right-4 top-1/2 -translate-y-1/2" bind:this={flagConfigContainer}>
    <FAB
      icon={flagConfigs.find((c) => c.id == flagConfig).icon}
      on:click={() => (flagConfigOpen = !flagConfigOpen)}
    />
    {#if flagConfigOpen}
      <span
        class="style-menu absolute top-full right-0 pt-4"
        style="box-shadow: 0 0;"
        use:clickOutside
        transition:enterExit
      >
        <Menu
          items={flagConfigs.map((c) => ({ label: c.name, icon: c.icon, id: c.id }))}
          on:chosen={(e) => {
            flagConfig = e.detail.id;
            flagConfigOpen = false;
          }}
        />
      </span>
    {/if}
  </span>
</div>
{#if flagConfig == "custom"}
  <div class="custom-boxes flex gap-4 max-lg:flex-col">
    <TextField style="filled" name="URL for obfuscation flags" bind:value={obfFlagsSource} />
    <TextField style="filled" name="URL for main flags" bind:value={mainFlagsSource} />
  </div>
{/if}
<div class="grid gap-4 lg:grid-cols-4 2xl:grid-cols-6">
  {#each $analysis.flags as flag}
    <FlagCard {...flag} on:open />
  {/each}
</div>

<style>
  .custom-boxes > :global(div),
  .custom-boxes > :global(div > div) {
    display: flex;
    flex: 1;
  }
  .custom-boxes :global(*) {
    border-style: unset;
  }
</style>
