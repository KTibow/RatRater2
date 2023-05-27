<script>
  import { createEventDispatcher } from "svelte";

  export let obfuscation;
  const dispatch = createEventDispatcher();
</script>

<table>
  {#each obfuscation as [obfuscator, info]}
    <tr>
      <td class="min-w-[20ch] border-r border-outline pr-2">{obfuscator}</td>
      <td class="max-w-2xl px-2 font-mono text-primary">
        <button
          on:click={() => dispatch("open", { file: info.file, find: info.find })}
          class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {info.file}
        </button>
      </td>
    </tr>
  {/each}
</table>
