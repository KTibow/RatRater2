<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-description";
  import iconCode from "@iconify-icons/ic/outline-code";
  import iconExtension from "@iconify-icons/ic/outline-extension";
  import iconFolder from "@iconify-icons/ic/folder";
  import iconOpenFolder from "@iconify-icons/ic/outline-folder";
  import { sortTree } from "./tree";

  export let nodes;
  export let openByDefault;
  const dispatch = createEventDispatcher();

  let openFolders = new Set();
  const toggleFolder = (name) => {
    if (openFolders.has(name)) openFolders.delete(name);
    else openFolders.add(name);
    openFolders = openFolders;
  };
  $: if (openByDefault) openFolders = new Set(Object.keys(nodes));
</script>

{#each sortTree(nodes) as [name, contents]}
  {#if contents == 0}
    <button
      class="shared-name shared-ring flex items-center gap-2 text-primary"
      on:click={() => dispatch("open", name)}
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
    <button
      class="shared-name shared-ring flex items-center gap-2"
      on:click={() => toggleFolder(name)}
    >
      <Icon icon={openFolders.has(name) ? iconOpenFolder : iconFolder} class="flex-shrink-0" />
      <span class="shared-chop inline-block">{name}</span>
    </button>
    {#if openFolders.has(name)}
      <div class="border-l border-transparent pl-6 group-hover:border-surface-variant">
        <svelte:self
          nodes={contents}
          on:open={(e) => {
            dispatch("open", name + "/" + e.detail);
          }}
        />
      </div>
    {/if}
  {/if}
{/each}

<style lang="postcss">
  .shared-name {
    @apply w-full whitespace-nowrap font-mono;
  }
  .shared-ring {
    @apply rounded-lg outline-2 outline-offset-2 outline-primary hover:outline;
  }
  .shared-chop {
    @apply overflow-hidden text-ellipsis;
  }
</style>
