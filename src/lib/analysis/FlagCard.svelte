<script lang="ts">
  import { Divider, Button, easeEmphasized, sharedAxisTransition, ButtonLink } from "m3-svelte";
  import { slide } from "svelte/transition";
  import type { Flag } from "./createAnalysis";
  import { view } from "$lib/state";

  export let name: string;
  export let flag: Flag;
  let expandedFiles = false;
</script>

<div
  class="flex flex-col items-center rounded-xl bg-background p-4"
  in:sharedAxisTransition={{ direction: "Z", leaving: false }}
>
  <h2 class="m3-font-headline-small">{name}</h2>
  {#if expandedFiles || flag.matches.length == 1}
    <div class="w-full" transition:slide={{ easing: easeEmphasized }}>
      {#each flag.matches as file}
        <button
          class="underline-hover mt-2 block truncate font-mono text-primary underline"
          on:click={() => {
            $view = { tab: "browser", editorFile: file, editorFind: flag.initialFind };
          }}
          title={file}
        >
          {file}
        </button>
      {/each}
    </div>
  {:else}
    <p class="mt-2" transition:slide={{ easing: easeEmphasized }}>
      {flag.matches.length}
      {flag.matches.length == 1 ? "file" : "files"}
    </p>
  {/if}
  {#if flag.matches.length > 1}
    <div class="mt-auto w-full py-4">
      <Divider />
    </div>
    <div class="flex justify-center gap-2">
      <Button type="tonal" on:click={() => (expandedFiles = !expandedFiles)}>
        {expandedFiles ? "Collapse" : "Expand"} files
      </Button>
      {#if flag.link}
        <ButtonLink type="text" href={flag.link} extraOptions={{ target: "_blank" }}>
          Read about it
        </ButtonLink>
      {/if}
    </div>
  {:else if flag.link}
    <div class="mt-auto flex justify-center pt-4">
      <ButtonLink type="text" href={flag.link} extraOptions={{ target: "_blank" }}>
        Read about it
      </ButtonLink>
    </div>
  {/if}
</div>
