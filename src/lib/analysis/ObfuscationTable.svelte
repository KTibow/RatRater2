<script lang="ts">
  import type { Obfuscation } from "./createAnalysis";
  import { view } from "$lib/state";

  export let obfuscation: Obfuscation;
</script>

{#each obfuscation as [obfuscator, info], i}
  <div class:not-last={i != obfuscation.length - 1} class="w-full border-outline-variant">
    <p>{obfuscator}</p>
    {#if "file" in info}
      {@const file = info.file}
      <button
        on:click={() =>
          ($view = { tab: "browser", editorFile: file, editorFind: info.initialFind })}
        class="underline-hover truncate text-left font-mono text-primary underline"
      >
        {file}
      </button>
    {:else}
      <p class="truncate font-mono">{info.quote}</p>
    {/if}
  </div>
{/each}

<style lang="postcss">
  .not-last {
    @apply mb-2 border-b pb-2;
  }
</style>
