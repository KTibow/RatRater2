<script>
  import Icon from "@iconify/svelte";
  import iconLoading from "@iconify-icons/ic/outline-pending-actions";
  import FileCard from "$lib/analysis/FileCard.svelte";
  import Results from "$lib/analysis/Results.svelte";

  export let currentFile;
  export let loading;

  let progress;
  let hash;
  const updateHash = async () => {
    hash = null;
    const hashBytes = await crypto.subtle.digest("SHA-256", loading.data);
    hash = [...new Uint8Array(hashBytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };
  $: loading.data, updateHash();
</script>

{#if hash}
  <FileCard {currentFile} {hash} />
  <div class="h-6" />
  <Results zip={loading.zip} {hash} bind:progress on:open />
{:else}
  <div class="hash-layout m-auto rounded-2xl bg-primary/10 p-6">
    <Icon icon={iconLoading} height={24} />
    <p class="m3-font-headline-small">Hashing file...</p>
  </div>
{/if}

<style lang="postcss">
  .hash-layout {
    @apply flex flex-col items-center gap-4;
  }
</style>
