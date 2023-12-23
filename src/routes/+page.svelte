<script lang="ts">
  import iconLoading from "@ktibow/iconset-ic/outline-pending-actions";
  import iconError from "@ktibow/iconset-ic/outline-error";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";
  import { Button, easeEmphasized, sharedAxisTransition } from "m3-svelte";

  import { file, view } from "$lib/state";
  import Status from "./Status.svelte";
  import Home from "./Home.svelte";
  import FileAltInputs from "./FileAltInputs.svelte";
  import FileHeader from "$lib/FileHeader.svelte";
  import Results from "$lib/analysis/Results.svelte";
  import BrowserPane from "$lib/browser/BrowserPane.svelte";

  const hashes = writable();
  setContext("hashes", hashes);
  onMount(async () => {
    const hashResp = await fetch(
      "https://raw.githubusercontent.com/KTibow/RatRater2Back/main/hash-grab/hashes.json",
    );
    hashes.set(await hashResp.json());
  });

  $: if ($view.tab == "analysis") $view.editorFind = undefined;
</script>

<svelte:head><title>RatRater 2</title></svelte:head>
{#if $file.state == "loaded"}
  <main
    class="content-wrapper absolute min-h-screen w-full"
    class:h-screen={$view.tab == "browser"}
    transition:sharedAxisTransition={{ direction: "X", rightSeam: false }}
  >
    <FileHeader />
    {#if $view.tab == "analysis"}
      <div
        class="col-start-1 row-start-2 gap-6 p-4 sm:px-6"
        transition:fade={{ duration: 300, easing: easeEmphasized }}
      >
        <Results />
      </div>
    {:else}
      <div
        class="col-start-1 row-start-2"
        transition:fade={{ duration: 300, easing: easeEmphasized }}
      >
        <BrowserPane />
      </div>
    {/if}
  </main>
{:else if $file.state == "loading"}
  <main
    class="vertical-container absolute min-h-screen"
    in:sharedAxisTransition={{ direction: "X", rightSeam: false }}
  >
    <Status icon={iconLoading}>
      <p class="m3-font-headline-small">Loading file...</p>
    </Status>
  </main>
{:else if $file.state == "error"}
  <main
    class="vertical-container absolute min-h-screen"
    transition:sharedAxisTransition={{ direction: "X", rightSeam: false }}
  >
    <Status icon={iconError}>
      <p class="m3-font-headline-small">Couldn't open file</p>
      <p class="m3-font-body-medium text-on-surface-variant">
        Make sure you dragged in a .jar file or something else that's a zip file.
      </p>
      <div class="mt-2 flex">
        <Button type="filled" on:click={() => ($file = {})}>OK</Button>
      </div>
    </Status>
  </main>
{:else}
  <main
    class="vertical-container absolute min-h-screen p-4 sm:p-6"
    transition:sharedAxisTransition={{ direction: "X", rightSeam: true }}
  >
    <Home />
  </main>
{/if}
<FileAltInputs />

<style>
  .vertical-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  .content-wrapper {
    background-color: rgb(var(--m3-scheme-surface-container));
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .content-wrapper > * {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
