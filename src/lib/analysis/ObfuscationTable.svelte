<script lang="ts">
  import type { Obfuscation } from "./createAnalysis";
  import { view } from "$lib/state";

  export let obfuscation: Obfuscation;
</script>

{#each obfuscation as [obfuscator, info], i}
  <div class="w-full">
    <p>{obfuscator}</p>
    {#if "file" in info}
      {@const file = info.file}
      <button
        on:click={() =>
          ($view = { tab: "browser", editorFile: file, editorFind: info.initialFind })}
        class="underline-hover text-primary truncate text-left font-mono underline"
      >
        {file}
      </button>
    {:else}
      <p class="truncate font-mono">{info.quote}</p>
    {/if}
  </div>
  {#if i != obfuscation.length - 1}
    <hr class="border-current/50 w-full border-t" />
  {/if}
{/each}
