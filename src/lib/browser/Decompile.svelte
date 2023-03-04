<script>
  import { Chip, Dialog, Radio, Switch, Snackbar, SnackbarPlacer } from "m3-svelte";
  import iconPlay from "@iconify-icons/ic/outline-play-arrow";
  import JSZip from "jszip";

  export let decompiled;
  export let rawContent;
  /** @type {JSZip} */
  export let zip, openFile;

  let showingDecompiled, decompiledAvailable;
  $: {
    if (!rawContent) {
      decompiledAvailable = false;
      break $;
    }
    let hash = 0;
    Array.from(
      { length: rawContent.length },
      (_, i) => (hash = (Math.imul(31, hash) + rawContent.charCodeAt(i)) | 0)
    );
    const cache = JSON.parse(localStorage["rr2DecompilationCache"] || "{}")[hash];
    decompiledAvailable = cache ? cache : false;
  }
  $: {
    if (!decompiledAvailable) showingDecompiled = false;
    decompiled = showingDecompiled && decompiledAvailable;
  }

  let decompileDialog,
    decompiling = false,
    decompiler = "forgeflower",
    decompileAll = true;
  $: rawContent, (decompiling = false);
  const addToCache = (raw, decompiled) => {
    let hash = 0;
    Array.from(
      { length: raw.length },
      (_, i) => (hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0)
    );
    const caches = JSON.parse(localStorage["rr2DecompilationCache"] || "{}");
    caches[hash] = decompiled;
    localStorage["rr2DecompilationCache"] = JSON.stringify(caches);
  };
  const decompile = async () => {
    decompiling = "running";
    const form = new FormData(),
      pinnedRaw = rawContent;
    if (decompileAll) {
      const blob = await zip.generateAsync({ type: "blob" });
      form.set("file", blob, "file.jar");
    } else {
      const blob = await zip.files[openFile].async("blob");
      form.set("file", blob, "file.class");
    }

    let response;
    try {
      response = await fetch("http://localhost:8000/decompile?decompiler=" + decompiler, {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        decompiling = "error";
        console.error(response);
        return;
      }
    } catch (e) {
      decompiling = "error";
      console.error(e);
      return;
    }
    if (decompileAll) {
      const outputZip = await new JSZip().loadAsync(await response.arrayBuffer());
      await Promise.all(
        Object.values(zip.files).map(async (f) => {
          if (f.dir || !f.name.endsWith(".class")) return;
          const decompiledFile = outputZip.files[f.name.replace(/\.class$/, ".java")];
          if (!decompiledFile) return;
          const [raw, decompiled] = await Promise.all([
            f.async("string"),
            decompiledFile.async("string"),
          ]);
          addToCache(raw, decompiled);
          if (f.name == openFile) decompiledAvailable = decompiled;
        })
      );
    } else {
      decompiledAvailable = await response.text();
      addToCache(pinnedRaw, decompiledAvailable);
    }
    decompiling = "done";
  };
</script>

{#if decompiledAvailable}
  <Chip
    type="assist"
    selected={showingDecompiled}
    trailingIcon={iconPlay}
    on:click={() => (showingDecompiled = !showingDecompiled)}
    on:trailingClicked={() => (decompileDialog = true)}
  >
    Decompiled
  </Chip>
{:else}
  <Chip type="assist" on:click={() => (decompileDialog = true)}>Decompile</Chip>
{/if}
<Dialog
  bind:open={decompileDialog}
  title="Decompile file"
  confirmLabel="Decompile"
  cancelLabel="Cancel"
  on:closed={(e) => {
    if (e.detail.method == "clickConfirm") decompile();
  }}
>
  <p class="m3-font-label-large mb-2">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="forgeflower" bind:group={decompiler} name="decompiler" /> FernFlower
    </label>
  </p>
  <p class="m3-font-label-large mb-2">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="quiltflower" bind:group={decompiler} name="decompiler" /> QuiltFlower
    </label>
  </p>
  <p class="m3-font-label-large mb-2">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="procyon" bind:group={decompiler} name="decompiler" /> Procyon
    </label>
  </p>
  <p class="m3-font-label-large mb-4">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="cfr" bind:group={decompiler} name="decompiler" /> CFR
    </label>
  </p>
  <p class="m3-font-label-large">
    <label class="flex items-center gap-2" for={undefined}>
      <Switch bind:checked={decompileAll} /> Decompile whole .jar
    </label>
  </p>
</Dialog>
{#key decompiling}
  <SnackbarPlacer>
    <Snackbar open={decompiling}>
      Decompiling {decompiling}
    </Snackbar>
  </SnackbarPlacer>
{/key}
