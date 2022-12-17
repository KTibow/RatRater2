<script>
  export let styling = "p-6 m-4";
  export let disabled;
</script>

<button
  on:click
  {disabled}
  class="text-center {styling} rounded-lg bg-sweep bg-[length:200%_200%] transition-all hover:bg-[position:100%] disabled:bg-neutral-800 disabled:bg-none"
>
  <slot />
</button>
