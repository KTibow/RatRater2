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
        class="underline-hover truncate text-left font-mono text-primary underline"
      >
        {file}
      </button>
    {:else}
      <p class="truncate font-mono">{info.quote}</p>
    {/if}
  </div>
  {#if i != obfuscation.length - 1}
    <hr class="w-full border-t border-current/50" />
  {/if}
{/each}
