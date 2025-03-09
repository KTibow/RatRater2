<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Layer } from "m3-svelte";
  import Icon from "@iconify/svelte";
  import iconFile from "@ktibow/iconset-ic/outline-description";
  import iconCode from "@ktibow/iconset-ic/outline-code";
  import iconExtension from "@ktibow/iconset-ic/outline-extension";
  import iconFolder from "@ktibow/iconset-ic/folder";
  import iconOpenFolder from "@ktibow/iconset-ic/outline-folder";
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
      class="shared-name text-primary flex items-center gap-2"
      on:click={() => dispatch("chosen", name)}
    >
      <Layer />
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
      <Layer />
      <Icon icon={openFolders.has(name) ? iconOpenFolder : iconFolder} class="flex-shrink-0" />
      <span class="shared-chop inline-block">{name}</span>
    </button>
    {#if openFolders.has(name)}
      <div class="group-hover:border-primary/50 border-l border-transparent pl-6 transition-colors">
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
  @reference "../../app.css";
  button {
    @apply relative transition-colors;
    margin-left: -0.25rem;
    padding-left: 0.25rem;
    border-radius: 0.5rem;
  }
  .shared-name {
    @apply w-full whitespace-nowrap font-mono;
  }
  .shared-chop {
    @apply overflow-hidden text-ellipsis;
  }
</style>
