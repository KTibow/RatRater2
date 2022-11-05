<script>
  export let zip;
  export let analyses = {};
  export let stage = 0;
  $: {
    if (stage == 0 && zip) {
      stage = 1;
      Promise.all(zip.files.map((file) => {})).then(() => (stage = 2));
    }
  }
</script>
