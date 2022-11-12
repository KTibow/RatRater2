<script>
  import { createEventDispatcher } from "svelte";

  export let folder;
  export let name;
  export let open;

  export let activePath;

  let entries;
  $: entries = Object.entries(folder).sort(([nameA, partA], [nameB, partB]) => {
    const folderComp =
      !(partA["is/folder"] || nameA.includes("/")) - !(partB["is/folder"] || nameB.includes("/"));
    return folderComp || nameA.localeCompare(nameB);
  });
  const dispatch = createEventDispatcher();
</script>

<details bind:open>
  <summary
    class="my-2 flex cursor-pointer list-none rounded-md px-2 py-1 transition-all hover:bg-blue-500/30"
  >
    <span class="opacity-70">
      {name.split("/").slice(0, -1).join("/") + (name.includes("/") ? "/" : "")}
    </span>
    {name.split("/").at(-1)}
    <span class="ml-auto">{open ? "⬆️" : "⬇️"}</span>
  </summary>
  <div class="border-l-4 border-blue-500/40 pl-2">
    {#each entries as [itemName, part]}
      {#if part["is/folder"]}
        <svelte:self folder={part} name={itemName} bind:activePath />
      {:else if itemName != "is/folder"}
        <p
          class="my-2 flex cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-blue-500/30"
          class:selected={activePath == part.name}
          on:click={() => (activePath = part.name)}
        >
          <span class="opacity-70">
            {itemName.split("/").slice(0, -1).join("/") + (itemName.includes("/") ? "/" : "")}
          </span>
          {itemName.split("/").at(-1)}
        </p>
      {/if}
    {/each}
  </div>
</details>

<style>
  .selected {
    @apply bg-blue-500;
  }
</style>
