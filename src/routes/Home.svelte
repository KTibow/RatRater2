<script>
  import FileChooser from "$lib/files/FileChooser.svelte";
</script>

<h1 class="my-6 text-5xl md:text-9xl">RatRater 2</h1>
<p class="mt-2">
  RatRater is a tool that analyzes .jar files for known signs of infostealers (rats), common among
  the Hypixel Skyblock modding community.
</p>
<p class="mb-2">We also accept drop/paste</p>
<FileChooser on:chosen />
<p class="mt-auto flex items-center gap-2">
  <span class="flex rounded-lg bg-primary px-2 py-1 text-on-primary">NEW</span>
  <a href="https://discord.gg/ARW8nnh5Kw" class="underline-hover">Discord</a>
</p>
<p class="mt-2">Made by @KTibow</p>
