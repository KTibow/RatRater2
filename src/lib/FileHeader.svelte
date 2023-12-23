<script lang="ts">
  import Icon from "@iconify/svelte";
  import iconFile from "@ktibow/iconset-ic/outline-insert-drive-file";
  import iconChart from "@ktibow/iconset-ic/outline-bar-chart";
  import iconFolder from "@ktibow/iconset-ic/outline-folder";
  import { Button } from "m3-svelte";
  import { file, view, type Loaded } from "$lib/state";

  const getSize = (bytes: number) =>
    bytes < 1000
      ? bytes + " B"
      : bytes < 1000000
        ? Math.floor(bytes / 1000) + " kB"
        : Math.floor(bytes / 1000000) + " MB";
  $: fileL = $file as Loaded;
</script>

<div class="row flex items-center">
  <Icon icon={iconFile} height={24} />
  <p class="whitespace-nowrap pl-4">{fileL.file.name}</p>
  <p class="mr-auto whitespace-nowrap pl-4">{getSize(fileL.file.size)}</p>
  <p class="hash max-lg:hidden">{fileL.hash}</p>
  {#if $view.tab == "analysis"}
    <Button type="tonal" iconType="left" on:click={() => ($view.tab = "browser")}>
      <Icon icon={iconFolder} />
      Browser
    </Button>
  {:else}
    <Button type="tonal" iconType="left" on:click={() => ($view.tab = "analysis")}>
      <Icon icon={iconChart} />
      Analysis
    </Button>
  {/if}
</div>

<style>
  .row {
    padding: 1rem 1rem 0 1rem;
    overflow: hidden;
  }
  @media (min-width: 640px) {
    .row {
      padding: 1rem 1.5rem 0 1.5rem;
    }
  }
  .row > :global(*) {
    flex-shrink: 0;
  }
  .hash {
    flex-shrink: 1;
    overflow: hidden;
    padding-right: 1rem;
  }
</style>
