<script>
  import Sidebar from "$lib/Files/Sidebar.svelte";
  import Background from "$lib/Panel/Background.svelte";
  import Chooser from "$lib/Panel/Chooser.svelte";
  import Viewer from "$lib/Files/Viewer.svelte";

  let activeFile;
  let activeFileName;
  let activePath;

  $: console.log(activeFile);
</script>

<div class="flex min-h-screen flex-col lg:flex-row">
  <Sidebar {activeFile} {activeFileName} bind:activePath />
  {#if activeFile}
    {#if activePath}
      <Viewer zip={activeFile} path={activePath} />
    {:else}
      <Background bind:activeFile>TODO</Background>
    {/if}
  {:else}
    <Background bind:activeFile>
      <Chooser bind:activeFile bind:activeFileName />
    </Background>
  {/if}
</div>
