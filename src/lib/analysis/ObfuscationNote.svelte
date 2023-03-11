<script>
  import { Card } from "m3-svelte";
  import { createEventDispatcher } from "svelte";

  export let data;
  const dispatch = createEventDispatcher();
</script>

<Card type="elevated">
  <div class="flex max-lg:flex-col">
    <p class="mr-auto">
      <abbr title="a way of hiding what a program does that might confuse ratrater">
        Obfuscation
      </abbr>
      was detected.
    </p>
    <table>
      {#each data as obfuscator}
        <tr>
          <td class="border-r border-outline pr-2">{obfuscator.name}</td>
          {#if obfuscator.file}
            <td class="max-w-2xl px-2 font-mono text-primary">
              <button
                on:click={() => dispatch("open", { file: obfuscator.file, find: obfuscator.find })}
                class="max-w-full overflow-hidden text-ellipsis"
              >
                {obfuscator.file}
              </button>
            </td>
          {:else}
            <td class="max-w-2xl px-2 font-mono">
              <span class="max-w-full overflow-hidden text-ellipsis">{obfuscator.example}</span>
            </td>
          {/if}
        </tr>
      {/each}
    </table>
  </div>
  <!--todo: add options for deobfuscation -->
</Card>
