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
        return flags.indexOf(origAFlag) - flags.indexOf(origBFlag);
      });
  let flagGroups;
  $: console.log("flag groups", (flagGroups = groupFlagsByFlag($analysis)));
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
  </div>
{/if}
