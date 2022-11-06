<script>
  export let styling = "inline-block p-6 m-4";
</script>

<button
  on:click
  class="{styling} rounded-lg bg-sweep bg-[length:200%_200%] transition-all hover:bg-[position:100%]"
>
  <slot />
</button>
