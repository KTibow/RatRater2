<script>
  import { Divider, Button, easeEmphasized, sharedAxisTransition } from "m3-svelte";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  export let name;
  export let matches = [];
  export let link;
  export let find;
  let expandedFiles = false;
  const dispatch = createEventDispatcher();
</script>

<div
  class="flex flex-col items-center rounded-xl bg-primary/5 p-4"
  in:sharedAxisTransition={{ direction: "Z", leaving: false }}
>
  <h2 class="m3-font-headline-small">{name}</h2>
  {#if expandedFiles}
    <div class="w-full" transition:slide|local={{ easing: easeEmphasized }}>
      {#each matches as file}
        <button
          class="shared-chop mt-2 block font-mono text-primary"
          on:click={() => dispatch("open", { file, find })}
          title={file}
        >
          {file}
        </button>
      {/each}
    </div>
  {:else}
    <p class="mt-2" transition:slide|local={{ easing: easeEmphasized }}>
      {matches.length}
      {matches.length == 1 ? "file" : "files"}
    </p>
  {/if}
  <div class="mt-auto w-full py-4">
    <Divider verticalSpace={false} />
  </div>
  <div class="flex justify-center gap-2">
    <Button type="tonal" on:click={() => (expandedFiles = !expandedFiles)}>
      {expandedFiles ? "Collapse" : "Expand"} files
    </Button>
    {#if link}
      <Button type="text" href={link} extraOptions={{ target: "_blank" }}>Flag info</Button>
    {/if}
  </div>
</div>

<style lang="postcss">
  .shared-chop {
    @apply w-full overflow-hidden text-ellipsis whitespace-nowrap;
  }
</style>
