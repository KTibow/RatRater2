<script>
  import { createEventDispatcher } from "svelte";

  export let obfuscation;
  const dispatch = createEventDispatcher();
</script>

{#each obfuscation as [obfuscator, info], i}
  <div class:not-last={i != obfuscation.length - 1} class="w-full border-primary/50">
    <p>{obfuscator}</p>
    <button
      on:click={() => dispatch("open", { file: info.file, find: info.find })}
      class="underline-hover truncate font-mono text-primary underline"
    >
      {info.file}
    </button>
  </div>
{/each}

<style lang="postcss">
  .not-last {
    @apply mb-2 border-b pb-2;
  }
  .truncate {
    @apply w-full overflow-hidden text-ellipsis whitespace-nowrap text-left;
  }
</style>
