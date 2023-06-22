<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Obfuscation } from "./createAnalysis";

  export let obfuscation: Obfuscation;
  const dispatch = createEventDispatcher();
</script>

{#each obfuscation as [obfuscator, info], i}
  <div class:not-last={i != obfuscation.length - 1} class="w-full border-primary/50">
    <p>{obfuscator}</p>
    {#if "file" in info}
      {@const file = info.file}
      <button
        on:click={() => dispatch("open", file)}
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
