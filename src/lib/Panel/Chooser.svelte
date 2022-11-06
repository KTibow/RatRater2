<script>
  import { loadFile } from "$lib/openZip.js";
  import Modal from "$lib/Modal.svelte";
  import Button from "$lib/Button.svelte";

  export let activeFile;
  export let activeFileName;

  let modalOpen;
  let modalContents;
  let currentlyDragging;
  let fileChooser;
</script>

<h1 class="text-4xl font-bold lg:text-9xl">RatRater 2</h1>
<p>
  RatRater is a tool that analyzes .jar files for known signs of infostealers, common among the
  Hypixel Skyblock modding community.
</p>
<Button styling="inline-block mt-4 p-6" on:click={() => fileChooser.click()}>Choose a file</Button>
<input
  type="file"
  class="hidden"
  bind:this={fileChooser}
  on:change={async (e) => {
    const file = e.target.files[0];
    currentlyDragging = false;
    activeFileName = file.name;
    try {
      activeFile = await loadFile(file);
    } catch (e) {
      console.error(e);
      modalContents = "Could not open the jar file as a zip. Make sure it's valid.";
      modalOpen = true;
    }
  }}
/>
<Modal bind:open={modalOpen}>{modalContents}</Modal>
<div
  class="fixed left-0 right-0 top-0 bottom-0 flex items-center justify-center bg-black/50 transition-all"
  class:invisible={!currentlyDragging}
  class:opacity-0={!currentlyDragging}
>
  <p class="text-2xl">or you can just drop it, that works too</p>
</div>
<svelte:window
  on:dragover|preventDefault={(e) => {
    currentlyDragging = true;
  }}
  on:dragleave={(e) => {
    currentlyDragging = false;
  }}
  on:drop|preventDefault={async (e) => {
    const file = e.dataTransfer.files[0];
    currentlyDragging = false;
    activeFileName = file.name;
    try {
      activeFile = await loadFile(file);
    } catch (e) {
      console.error(e);
      modalContents = "Could not open the jar file as a zip. Make sure it's valid.";
      modalOpen = true;
    }
  }}
/>
