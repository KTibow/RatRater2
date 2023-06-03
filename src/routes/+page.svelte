<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import { Button, Tabs, easeEmphasized, sharedAxisTransition } from "m3-svelte";
  import iconLoading from "@iconify-icons/ic/outline-pending-actions";
  import iconError from "@iconify-icons/ic/outline-error";
  import { file, loadFile, view } from "$lib/state";
  import Status from "$lib/files/Status.svelte";
  import Home from "./Home.svelte";
  import BrowserPane from "$lib/browser/BrowserPane.svelte";
  import FileAltInputs from "$lib/files/FileAltInputs.svelte";
  import AnalysisPane from "$lib/analysis/AnalysisPane.svelte";

  const hashes = writable();
  setContext("hashes", hashes);
  onMount(async () => {
    const hashResp = await fetch(
      "https://raw.githubusercontent.com/KTibow/RatRater2Back/main/hash-grab/hashes.json"
    );
    hashes.set(await hashResp.json());
  });
  $: $view.tab, ($view.editorFind = undefined);

  const slideLeft = (node: Element) => {
    return {
      easing: easeEmphasized,
      css: (t: number, u: number) => `
      transform: translateX(${u * -100}vw)`,
    };
  };
  const slideRight = (node: Element) => {
    return {
      easing: easeEmphasized,
      css: (t: number, u: number) => `
      transform: translateX(${u * 100}vw)`,
    };
  };
</script>

<svelte:head><title>RatRater 2</title></svelte:head>
{#if $file.state == "loading"}
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
{:else if $file.state == "loaded"}
  <main
    class="content-wrapper absolute min-h-screen w-full"
    class:h-screen={$view.tab == 1}
    transition:sharedAxisTransition={{ direction: "X", rightSeam: false }}
  >
    <div class="contents">
      <Tabs
        items={[{ name: "Analysis" }, { name: "Browser" }]}
        style="primary"
        bind:activeItem={$view.tab}
      />
    </div>
    {#if $view.tab == 0}
      <div class="col-start-1 row-start-2 flex flex-col" transition:slideLeft|local>
        <AnalysisPane
          on:open={(e) => {
            $view = { tab: 1, editorFile: e.detail, editorFind: $view.editorFind };
          }}
        />
      </div>
    {:else}
      <div class="col-start-1 row-start-2 flex flex-col" transition:slideRight|local>
        <BrowserPane />
      </div>
    {/if}
  </main>
{:else}
  <main
    class="vertical-container absolute min-h-screen p-6"
    transition:sharedAxisTransition={{ direction: "X", rightSeam: true }}
  >
    <Home on:chosen={(e) => loadFile(e.detail)} />
  </main>
{/if}

<FileAltInputs
  on:chosen={(e) => {
    $view.editorFile = undefined;
    loadFile(e.detail);
  }}
/>

<style lang="postcss">
  .vertical-container {
    @apply flex w-full flex-col items-start;
  }
  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
</style>
