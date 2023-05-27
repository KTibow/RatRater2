<script>
  import { createEventDispatcher } from "svelte";

  export let obfuscation;
  const dispatch = createEventDispatcher();
</script>

{#each obfuscation as [obfuscator, info], i}
  <div class:not-last={i != obfuscation.length - 1} class="w-full border-outline">
    <p>{obfuscator}</p>
    <button
      on:click={() => dispatch("open", { file: info.file, find: info.find })}
      class="max-w-2xl overflow-hidden text-ellipsis whitespace-nowrap font-mono text-primary"
    >
      {info.file}
    </button>
  </div>
{/each}

<style lang="postcss">
  .not-last {
    @apply mb-2 border-b;
  }
</style>
