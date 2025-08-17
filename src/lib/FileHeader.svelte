<script lang="ts">
  import { Icon } from "m3-svelte";
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
  <Icon icon={iconFile} width="1.5rem" height="1.5rem" />
  <p class="pl-4 whitespace-nowrap">{fileL.file.name}</p>
  <p class="mr-auto pl-4 whitespace-nowrap">{getSize(fileL.file.size)}</p>
  <p class="hash max-l:hidden">{fileL.hash}</p>
  {#if $view.tab == "analysis"}
    <Button variant="tonal" iconType="left" onclick={() => ($view.tab = "browser")}>
      <Icon icon={iconFolder} />
      Browser
    </Button>
  {:else}
    <Button variant="tonal" iconType="left" onclick={() => ($view.tab = "analysis")}>
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
