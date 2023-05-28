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
<p class="mt-auto">
  Made by KTibow with <a href="https://discord.gg/7sBMTv7AF3" class="underline-hover">Vanta</a>
</p>
