<script>
  export let activeFile;
  export let activeFileName;
</script>

{#if activeFile}
  <div class="flex-shrink-0 bg-neutral-800 lg:w-1/4">
    <div class="w-full bg-neutral-900 p-4 font-bold">{activeFileName}</div>
  </div>
{/if}
