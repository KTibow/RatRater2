<script lang="ts">
  import FileCard from "$lib/analysis/FileCard.svelte";
  import Results from "$lib/analysis/Results.svelte";
  import { easeEmphasized } from "m3-svelte";

  const slideTransition = (node: Element) => {
    return {
      easing: easeEmphasized,
      css: (t: number, u: number) => `transform: translateX(${u * -100}vw)`,
    };
  };
</script>

<div class="col-start-1 row-start-2 flex grow flex-col gap-6 p-6" transition:slideTransition>
  <FileCard />
  <Results on:open />
</div>
