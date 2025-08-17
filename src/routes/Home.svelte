<script lang="ts">
  import { Layer } from "m3-svelte";
  import { loadFile } from "$lib/state";
  import Branding from "./Branding.svelte";

  let chooser: HTMLInputElement;
</script>

<Branding />
<input
  type="file"
  bind:this={chooser}
  class="hidden"
  on:change={() => {
    const file = chooser.files && chooser.files[0];
    if (!file) return;
    loadFile(file);
  }}
/>
<div class="mt-6 grid grow grid-cols-3 gap-6 self-stretch">
  <button
    class="relative flex items-center justify-center rounded-lg bg-primary text-on-primary"
    on:click={() => chooser.click()}
  >
    <Layer />
    Choose a file
  </button>
  <div class="flex items-center justify-center rounded-lg bg-surface-container">Drop</div>
  <div class="flex items-center justify-center rounded-lg bg-surface-container">Paste</div>
</div>
