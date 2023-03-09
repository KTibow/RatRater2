<script>
  import { Card } from "m3-svelte";

  export let flag;
  export let hash;
</script>

{#if flag}
  <Card type="elevated">Almost definitely a rat. TODO: actually get flag</Card>
{:else if hash == "error"}
  <Card type="elevated">No obvious flags, but RatRater couldn't get the list of official mods</Card>
{:else if hash}
  <Card type="elevated">
    <details>
      <summary class="-m-4 cursor-pointer p-4">Found in official sources</summary>
      <p class="my-2">
        RatRater automatically grabs mods from official sources. This file's contents are identical
        to an officially released one:
      </p>
      <table class="w-full">
        <tr>
          <td class="border-r border-outline pr-2">File</td>
          <td class="border-r border-outline px-2">Source</td>
          <td class="pl-2">Added</td>
        </tr>
        <tr>
          <td class="border-r border-outline pr-2">{hash.file}</td>
          <td class="border-r border-outline px-2">{hash.source}</td>
          <td class="pl-2">{new Date(hash.time).toLocaleString()}</td>
        </tr>
      </table>
    </details>
  </Card>
{/if}
