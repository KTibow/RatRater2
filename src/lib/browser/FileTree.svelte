<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-description";
  import iconCode from "@iconify-icons/ic/outline-code";
  import iconExtension from "@iconify-icons/ic/outline-extension";
  import iconFolder from "@iconify-icons/ic/folder";
  import iconOpenFolder from "@iconify-icons/ic/outline-folder";
  import { sortTree, type Tree } from "./tree";

  export let nodes: Tree;
  const dispatch = createEventDispatcher();

  let openFolders = new Set();
  const toggleFolder = (name: string) => {
    if (openFolders.has(name)) openFolders.delete(name);
    else openFolders.add(name);
    openFolders = openFolders;
  };
</script>

{#each sortTree(nodes) as [name, contents]}
  {#if contents == 0}
    <button
      class="shared-name flex items-center gap-2 text-primary"
      on:click={() => dispatch("chosen", name)}
    >
      <Icon
        icon={name.endsWith(".class")
          ? /\$[a-z0-9]+.class$/gi.test(name)
            ? iconExtension
            : iconCode
          : iconFile}
        class="flex-shrink-0"
      />
      <span class="shared-chop inline-block">{name}</span>
    </button>
  {:else}
    <button class="shared-name flex items-center gap-2" on:click={() => toggleFolder(name)}>
      <Icon icon={openFolders.has(name) ? iconOpenFolder : iconFolder} class="flex-shrink-0" />
      <span class="shared-chop inline-block">{name}</span>
    </button>
    {#if openFolders.has(name)}
      <div class="border-l border-transparent pl-6 transition-colors group-hover:border-primary/50">
        <svelte:self
          nodes={contents}
          on:chosen={(e) => {
            dispatch("chosen", name + "/" + e.detail);
          }}
        />
      </div>
    {/if}
  {/if}
{/each}

<style lang="postcss">
  button {
    @apply transition-colors rounded-md -ml-1 pl-1;
  }
  button:hover {
    @apply bg-primary-container/50 text-on-primary-container;
  }
  button:active {
    @apply bg-primary-container text-on-primary-container;
  }
  .shared-name {
    @apply w-full whitespace-nowrap font-mono;
  }
  .shared-chop {
    @apply overflow-hidden text-ellipsis;
  }
</style>
