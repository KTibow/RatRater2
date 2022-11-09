<script>
  import Sidebar from "$lib/Files/Sidebar.svelte";
  import Background from "$lib/Panel/Background.svelte";
  import Chooser from "$lib/Panel/Chooser.svelte";
  import Analysis from "$lib/Panel/Analysis.svelte";
  import Viewer from "$lib/Panel/Viewer.svelte";

  let activeFile;
  let activeFileName;
  let activePath;

  $: console.log(activeFile);
</script>

<div class="flex min-h-screen flex-col lg:flex-row">
  <Sidebar bind:activeFile bind:activeFileName bind:activePath />
  {#if activeFile}
    {#if activePath}
      <Viewer zip={activeFile} bind:path={activePath} />
    {:else}
      <Background bind:activeFile>
        <Analysis />
      </Background>
    {/if}
  {:else}
    <Background bind:activeFile>
      <h1 class="text-4xl font-bold lg:text-9xl">RatRater 2</h1>
      <p>
        RatRater is a tool that analyzes .jar files for known signs of infostealers, common among
        the Hypixel Skyblock modding community.
      </p>
      <Chooser bind:activeFile bind:activeFileName />
    </Background>
  {/if}
</div>
