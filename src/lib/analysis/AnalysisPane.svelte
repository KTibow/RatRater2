<script lang="ts">
  import FileCard from "$lib/analysis/FileCard.svelte";
  import Results from "$lib/analysis/Results.svelte";
</script>

<div class="flex flex-1 flex-col gap-6 p-6">
  <FileCard />
  <Results on:open />
</div>
