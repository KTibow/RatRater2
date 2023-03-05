<script>
  import { Button, sharedAxisTransition, Tabs } from "m3-svelte";
  import Icon from "@iconify/svelte";
  import iconError from "@iconify-icons/ic/outline-error";
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
        <div class="m-auto flex flex-col items-center gap-4 rounded-2xl bg-primary/10 p-6">
          <Icon icon={iconError} height={24} class="text-secondary" />
          <p class="m3-font-headline-small">Couldn't open file</p>
          <p class="m3-font-body-medium text-on-surface-variant">
            Make sure you dragged in a .jar file or something else that's a zip file.
          </p>
          <div class="mt-2 flex">
            <Button type="filled" on:click={() => (currentFile = null)}>OK</Button>
          </div>
        </div>
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
