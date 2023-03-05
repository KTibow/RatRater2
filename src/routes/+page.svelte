<script>
  import { sharedAxisTransition, Tabs } from "m3-svelte";
  import Home from "./Home.svelte";
  import FileAltInputs from "$lib/files/FileAltInputs.svelte";
  import Footer from "./Footer.svelte";
  import FileWrapper from "./FileWrapper.svelte";
  import FileAnalysis from "./FileAnalysis.svelte";
  import FileBrowser from "./FileBrowser.svelte";

  let currentFile;
  let browserActive = 0;
  let openFile;
</script>

<svelte:head><title>RatRater 2</title></svelte:head>
{#if currentFile}
  <FileWrapper file={currentFile} let:loading>
    <div class="flex w-full flex-col">
      <Tabs
        items={[{ name: "Analysis" }, { name: "Browser" }]}
        style="primary"
        bind:activeItem={browserActive}
      />
    </div>
    <div class="flex w-full grow flex-col overflow-hidden p-6">
      {#if loading.status == "errored"}
        <p>Could not open file. .jar files are supposed to be zip files.</p>
      {:else if loading.status == "loaded"}
        {#if browserActive == 0}
          <FileAnalysis
            {currentFile}
            {loading}
            on:open={(e) => {
              openFile = e.detail;
              browserActive = 1;
            }}
          />
        {:else}
          <FileBrowser bind:openFile {loading} />
        {/if}
      {:else}
        <p>Opening file...</p>
      {/if}
    </div>
  </FileWrapper>
{:else}
  <main
    class="absolute flex min-h-screen w-full flex-col items-start p-6"
    transition:sharedAxisTransition={{ direction: "X", rightSeam: true }}
  >
    <Home on:chosen={(e) => (currentFile = e.detail)} />
    <Footer />
  </main>
{/if}

<FileAltInputs
  on:chosen={(e) => {
    currentFile = e.detail;
    openFile = null;
  }}
/>
