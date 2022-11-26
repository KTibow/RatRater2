<script>
  import TfamLink from "$lib/TFAMLink.svelte";
  import AnalysisItem from "./AnalysisItem.svelte";
  import { analyze, checkObf } from "./analyze";
  import { flags } from "./matchers";
  import Table from "./Table.svelte";
  export let activeFile;

  let analysis, meta, obfFlags, obfProgress;
  $: ({ analysis, meta: meta } = analyze(activeFile));
  $: ({ obfFlags, progress: obfProgress } = checkObf(activeFile));
  // $: console.log($analysis);
  const groupFlagsByFlag = (analysis) =>
    Object.entries(analysis)
      .map(([name, flags]) => flags.map((flag) => ({ ...flag, file: name })))
      .reduce((prev, flags) => [...prev, ...flags], [])
      .reduce((flagsFound, flag) => {
        let flagGroup = flagsFound.find((otherFlag) => otherFlag.match == flag.match);
        if (!flagGroup) {
          flagGroup = { ...flag, files: [] };
          flagsFound.push(flagGroup);
        }
        flagGroup.files.push(flag.file);
        return flagsFound;
      }, [])
      .sort((a, b) => {
        const origAFlag = flags.find((flag) => flag.match == a.match);
        const origBFlag = flags.find((flag) => flag.match == b.match);
        // const scoreDifference = origAFlag.importance.score - origBFlag.importance.score;
        return flags.indexOf(origAFlag) - flags.indexOf(origBFlag);
      });
  // .reduce((context, flag) => {
  //   context[flag.type] = [...(context[flag.type] || []), flag];
  //   return context;
  // }, {});
  let flagGroups;
  $: console.log((flagGroups = groupFlagsByFlag($analysis)));
  // const sortByFlags = (entries) => entries.sort((a, b) => a[1].length - b[1].length);
  // const countFlags = (flags) =>
  //   flags.reduce((previous, flag) => {
  //     previous[flag.type] = (previous[flag.type] || 0) + 1;
  //     return previous;
  //   }, {});
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
    {#if $obfFlags.length}
      <AnalysisItem
        name="Obfuscation"
        desc={'Rats can be obfuscated, which means their code is "obscure, unclear, or unintelligible". Obfuscation can stop RatRater from working properly.'}
      >
        <div class="inline-block w-full rounded-2xl bg-blue-900/50 p-4">
          <ul class="list-inside list-disc">
            {#each $obfFlags as flag}
              <li>
                <span class="text-lg font-bold">{flag.desc}</span>
                <p class="whitespace-pre-wrap break-words font-mono">{flag.code}</p>
              </li>
            {/each}
          </ul>
        </div>
      </AnalysisItem>
    {/if}
    <AnalysisItem name="Flags">
      <Table flags={flagGroups} />
    </AnalysisItem>
    <!-- <table class="overflow-hidden rounded-2xl bg-blue-900/50">
        <tr class="[&>*]border-2 [&>*]:border-blue-900 [&>*]:p-4">
          <th class="border-2 border-blue-900">Flag</th>
          <th>Files</th>
          <th>Meaning</th>
        </tr>
        <tr class="p-4 pt-0">
          <td>
            <p class="font-mono">/regex/i</p>
            <p>uses heroku</p>
          </td>
          <td>1 file</td>
          <td>It has a lorem ipsum dolor sit amet consectetur adipisicing elit. Quis.</td>
        </tr> -->
    <!-- {#each Object.entries(flagGroups) as [category, flags]}
          <h2 class="text-xl">{friendlyNames[category]}</h2>
          {#each flags as flag}
            <li>
              {flag.desc}
              <code>{flag.match}</code>
              <span
                class="inline cursor-pointer border-b-2 border-b-current text-blue-200 transition-all hover:border-b-4"
              >
                in {flag.files.length}
                {flag.files.length == 1 ? "file" : "files"} flagged
              </span>
            </li>
          {/each}
        {/each} -->
    <!-- </table> -->
    <!-- <div class="flex flex-wrap gap-4">
          {#each flags as flag}
            <div class="flex-1 cursor-pointer overflow-hidden rounded-lg bg-blue-800">
              <div class="m-4 mb-2">
                <h2 class="text-xl">{flag.desc}</h2>
                <p class="font-mono">{flag.match}</p>
                <p
                  class="inline border-b-2 border-b-current text-blue-200 transition-all hover:border-b-4"
                >
                  View {flag.files.length}
                  {flag.files.length == 1 ? "file" : "files"} flagged
                </p>
              </div>
              <div
                style="background-color: hsl({70 + flag.importance.score * -25}deg 84% 78%)"
                class="p-4 text-black"
              >
                {flag.importance.desc}
              </div>
            </div>
          {/each}
        </div>
        <!-- <div class="flex flex-wrap">
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
      </div> -->
  </div>
{/if}
