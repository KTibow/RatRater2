<script>
  export let name;
  export let desc;
</script>

<div class="mb-4 grid grid-cols-[20rem_minmax(0,1fr)]">
  <div>
    <h2 class="text-5xl font-light">{name}</h2>
    {#if desc}
      <p>{desc}</p>
    {/if}
  </div>
  <div class="inline-block rounded-2xl bg-blue-900/50 p-4"><slot /></div>
</div>
