<script lang="ts">
  import FileCard from "$lib/analysis/FileCard.svelte";
  import Results from "$lib/analysis/Results.svelte";
  import { file } from "$lib/state";

  $: zip = "zip" in $file && $file.zip;
</script>

<div class="flex flex-1 flex-col gap-6 p-6">
  <FileCard />
  {#if zip}
    <Results on:open />
  {/if}
</div>
