<script lang="ts">
  import FileCard from "$lib/analysis/FileCard.svelte";
  import Results from "$lib/analysis/Results.svelte";
  import { file } from "$lib/state";

  $: zip = "zip" in $file && $file.zip;
</script>

<div class="flex grow flex-col gap-6 p-6">
  <FileCard />
  {#if zip}
    {#key zip}
      <Results on:open />
    {/key}
  {/if}
</div>
