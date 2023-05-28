<script>
  import { Button, sharedAxisTransition, Tabs } from "m3-svelte";
  import Icon from "@iconify/svelte";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import iconError from "@iconify-icons/ic/outline-error";
  import Home from "./Home.svelte";
  import Footer from "./Footer.svelte";
  import FileAltInputs from "$lib/files/FileAltInputs.svelte";
  import FileWrapper from "./FileWrapper.svelte";
  import FileAnalysis from "$lib/analysis/FileAnalysis.svelte";
  import FileBrowser from "$lib/browser/FileBrowser.svelte";

  let currentFile;
  let activeTab = 0;
  let openFile;

  const hashes = writable();
  const initialFind = writable();
  setContext("hashes", hashes);
  setContext("initialFind", initialFind);
  $: if (activeTab != 1) $initialFind = null;
  onMount(async () => {
    const hashResp = await fetch(
      "https://raw.githubusercontent.com/KTibow/RatRater2Back/main/hash-grab/hashes.json"
    );
    const hashJson = await hashResp.json();
    hashes.set(hashJson);
  });
</script>

<svelte:head><title>RatRater 2</title></svelte:head>
{#if currentFile}
  <FileWrapper file={currentFile} let:loading>
    <div class="flex w-full flex-col">
      <Tabs
        items={[{ name: "Analysis" }, { name: "Browser" }]}
        style="primary"
        bind:activeItem={activeTab}
      />
    </div>
    <div class="flex w-full grow flex-col p-6" class:overflow-hidden={activeTab == 1}>
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
        {#if activeTab == 0}
          <FileAnalysis
            {currentFile}
            {loading}
            on:open={(e) => {
              openFile = e.detail.file;
              $initialFind = e.detail.initialFind;
              activeTab = 1;
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
    openFile = null;
    currentFile = e.detail;
  }}
/>
