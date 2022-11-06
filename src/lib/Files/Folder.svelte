<script>
  export let folder;
  export let name;
  export let open;

  export let activePath;

  let entries;
  $: entries = Object.entries(folder).sort(([nameA, partA], [nameB, partB]) => {
    const folderComp = Boolean(partA["is/folder"]) - Boolean(partB["is/folder"]);
    const subfolderComp = nameA.includes("/") - nameB.includes("/");
    return folderComp || subfolderComp || nameA.localeCompare(nameB);
  });
</script>

<details bind:open>
  <summary class="my-2 flex cursor-pointer list-none px-2 py-1 transition-all hover:bg-blue-500/30">
    {name}
    <span class="ml-auto">{open ? "⬆️" : "⬇️"}</span>
  </summary>
  <div class="border-l-4 border-blue-500/40 pl-2">
    {#each entries as [itemName, part]}
      {#if part["is/folder"]}
        <svelte:self folder={part} name={itemName} bind:activePath />
      {:else if itemName != "is/folder"}
        <p
          class="my-2 cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-blue-500/30"
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
    @apply bg-blue-500;
  }
</style>
