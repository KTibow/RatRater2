<script>
  import Icon from "@iconify/svelte";
  import iconImportant from "@iconify-icons/mdi/stop-alert";
  import iconWarning from "@iconify-icons/mdi/alert";
  import iconInfo from "@iconify-icons/mdi/info-circle";
  export let flags;
  const friendlyNames = {
    exfil: "Exfiltration",
    getData: "Getting data",
    signature: "Signatures",
  };
</script>

<table class="w-full overflow-hidden rounded-2xl p-4">
  <tr class="border-b-2 border-blue-300/50 bg-blue-900/70">
    {#each ["Flag", "Meaning", "Files"] as col}
      <th class="p-4 text-left uppercase tracking-wider text-blue-300">{col}</th>
    {/each}
  </tr>
  {#each flags as flag, i}
    <tr class="border-blue-300/50 bg-blue-900/70" class:border-b-2={i != flags.length - 1}>
      <td class="p-4 align-top">
        <p class="font-bold">{friendlyNames[flag.type]}</p>
        <p>{flag.desc}</p>
        <p class="font-mono text-blue-200">{flag.match}</p>
      </td>
      <td class="p-4 align-top">
        <p>{flag.importance.desc}</p>
        <div
          class="mt-2 inline-flex items-center border-2 p-2 {flag.importance.score == 3
            ? 'bg-red-900/50 border-red-900 text-red-100'
            : flag.importance.score == 2
            ? 'bg-amber-900/50 border-amber-900 text-amber-100'
            : 'bg-blue-900/50 border-blue-700 text-blue-100'} rounded-md"
        >
          <Icon
            icon={flag.importance.score == 3
              ? iconImportant
              : flag.importance.score == 2
              ? iconWarning
              : iconInfo}
          />
          <span class="ml-2">
            {flag.importance.score == 3
              ? "Important"
              : flag.importance.score == 2
              ? "Warning"
              : "Note"}
          </span>
        </div>
      </td>
      <td class="p-4 align-top">
        <button
          class="max-w-lg text-left text-blue-200 underline underline-offset-2 transition-all hover:underline-offset-4"
        >
          {flag.files.length == 1 ? flag.files : flag.files.length + "files"}
        </button>
      </td>
      <!-- {#each row as item}
        <td class="p-4">{item}</td>
      {/each} -->
    </tr>
  {/each}
</table>
