<script>
  import JSZip from "jszip";
  import { sharedAxisTransition } from "m3-svelte";
  import { tick } from "svelte";

  export let file;
  let loading = {};
  $: if (file) {
    loading = { status: "reading" };
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener("load", async () => {
      const data = reader.result;
      loading = { status: "unzipping", data };
      await tick();
      try {
        const zip = await new JSZip().loadAsync(data);
        loading = { status: "loaded", data, zip };
        console.log("loaded", file, data, zip);
      } catch (e) {
        loading = { status: "errored", data };
      }
    });
  }
</script>

<main
  class="absolute flex h-screen w-full flex-col items-start"
  transition:sharedAxisTransition={{ direction: "X", rightSeam: false }}
>
  <slot {loading} />
</main>
