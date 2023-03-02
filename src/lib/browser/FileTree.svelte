<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-description";
  import iconCode from "@iconify-icons/ic/outline-code";
  import iconFolder from "@iconify-icons/ic/folder";
  import { sortTree } from "./tree";

  export let nodes;
  const dispatch = createEventDispatcher();
</script>

{#each sortTree(nodes) as [name, contents]}
  {#if contents == 0}
    <button
      class="shared-name flex items-center gap-2 text-left text-primary"
      on:click={() => dispatch("open", name)}
    >
      <Icon icon={name.endsWith(".class") ? iconCode : iconFile} class="flex-shrink-0" />
      <span class="shared-chop inline-block">{name}</span>
    </button>
  {:else}
    <p class="shared-name shared-chop flex items-center gap-2">
      <Icon icon={iconFolder} />
      {name}
    </p>
    <div class="border-l border-transparent pl-6 group-hover:border-surface-variant">
      <svelte:self
        nodes={contents}
        on:open={(e) => {
          dispatch("open", name + "/" + e.detail);
        }}
      />
    </div>
  {/if}
{/each}

<style lang="postcss">
  .shared-name {
    @apply w-full font-mono;
  }
  .shared-chop {
    @apply overflow-hidden text-ellipsis;
  }
</style>
