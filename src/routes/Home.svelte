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
