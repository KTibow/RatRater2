<script>
  import TfamLink from "$lib/TFAMLink.svelte";
  import AnalysisItem from "./AnalysisItem.svelte";
  import { analyze, checkObf } from "./analyze";
  export let activeFile;

  let analysis, meta, obfFlags, obfProgress;
  $: ({ analysis, meta: meta } = analyze(activeFile));
  $: ({ obfFlags, progress: obfProgress } = checkObf(activeFile));
  // $: console.log($analysis);
  $: console.log($obfFlags);
  const sortByFlags = (entries) => entries.sort((a, b) => a[1].length - b[1].length);
  const countFlags = (flags) =>
    flags.reduce((previous, flag) => {
      previous[flag.type] = (previous[flag.type] || 0) + 1;
      return previous;
    }, {});
  // const categorizeFlags = (flags) =>
  //   flags.reduce((prev, flag) => {
  //     prev[flag.type] = [...(prev[flag.type] || []), flag];
  //     return prev;
  //   }, {});
  // let categorizedResults = {};
  // $: {
  //   categorizedResults = Object.entries($analysis)
  //     .map(([name, flags]) => flags.map((flag) => ({ ...flag, file: name })))
  // }
</script>

<h1 class="mb-8 text-4xl font-bold lg:text-9xl">Analysis</h1>
{#if $meta.matched < $meta.total}
  <p>
    Working on analyzing the files. {$meta.matched}/{$meta.total} are done.
  </p>
{/if}
{#if Object.keys($analysis).length == 0 && $obfFlags.length == 0}
  <p>
    Nothing was flagged. The file might not be a rat, or it might be obfuscated. Consider asking
    someone to check in <TfamLink />.
  </p>
{:else}
  <div class="w-full">
    <AnalysisItem
      name="Obfuscation"
      desc='Rats can be obfuscated, which means their code is "obscure, unclear, or unintelligible". Obfuscation can stop RatRater from working properly.'
    >
      <ul class="list-inside list-disc">
        {#each $obfFlags as flag}
          <li>
            <span class="text-lg font-bold">{flag.desc}</span>
            <p class="whitespace-pre-wrap break-words font-mono">{flag.code}</p>
          </li>
        {/each}
      </ul>
    </AnalysisItem>
    <AnalysisItem name="Files with flags">
      <div class="flex flex-wrap">
        {#each sortByFlags(Object.entries($analysis)) as [file, flags]}
          {#if flags.length > 0}
            {@const flagTypes = countFlags(flags)}
            <div
              class="flex-1 basis-[65ch] cursor-pointer rounded-lg bg-blue-800 p-4 transition-all hover:bg-blue-700"
            >
              <h2 class="text-xl">{file}</h2>
              {#each Object.entries(flagTypes) as [type, count]}
                <p>{count} {type} {count == 1 ? "flag" : "flags"}</p>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    </AnalysisItem>
  </div>
{/if}
