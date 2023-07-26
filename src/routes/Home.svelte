<script lang="ts">
  import { Button } from "m3-svelte";
  import { loadFile } from "$lib/state";

  let chooser: HTMLInputElement;
</script>

<h1 class="my-6 text-5xl md:text-9xl">RatRater 2</h1>
<p class="my-2 flex-col lg:flex">
  <span>
    RatRater is a tool that analyzes .jar files for known signs of infostealers (rats), common among
    the Hypixel Skyblock community.
  </span>
  <span>Drop, paste, or...</span>
</p>
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
<Button type="filled" on:click={() => chooser.click()}>Choose a file</Button>
<p class="mt-auto">
  Made by @KTibow - <a href="https://discord.gg/ARW8nnh5Kw" class="underline-hover">RR2 Discord</a>
  - <a href="https://discord.gg/7sBMTv7AF3" class="underline-hover">Vanta</a>
</p>
