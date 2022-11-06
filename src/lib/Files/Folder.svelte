<script>
  export let folder;
  export let name;
  export let open;

  export let activePath;

  let entries;
  $: entries = Object.entries(folder).sort(([nameA, partA], [nameB, partB]) => {
    const folderComp = Boolean(partA["is/folder"]) - Boolean(partB["is/folder"]);
    return folderComp || nameA.localeCompare(nameB);
  });
</script>

<details bind:open>
  <summary class="cursor-pointer list-none">{open ? "⬆️" : "⬇️"} {name}</summary>
  <div class="border-l-4 border-blue-500/40 pl-2">
    {#each entries as [itemName, part]}
      {#if part["is/folder"]}
        <svelte:self folder={part} name={itemName} bind:activePath />
      {:else if itemName != "is/folder"}
        <p
          class="cursor-pointer text-blue-400"
          class:selected={activePath == part.name}
          on:click={() => (activePath = part.name)}
        >
          {itemName}
        </p>
      {/if}
    {/each}
  </div>
</details>

<style>
  .selected {
    @apply rounded-md bg-blue-500 text-white;
  }
</style>
