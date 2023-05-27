<script>
  import { Chip, Dialog, Radio, Switch, Snackbar, SnackbarPlacer } from "m3-svelte";
  import iconRefresh from "@iconify-icons/ic/outline-refresh";
  import JSZip from "jszip";
  import { hash } from "$lib/hash";

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
    const cache = JSON.parse(localStorage["rr2DecompilationCache"] || "{}")[hash(rawContent)];
    decompiledAvailable = cache ? cache : false;
  }
  $: {
    if (!decompiledAvailable) showingDecompiled = false;
    decompiled = showingDecompiled && decompiledAvailable;
  }

  let decompileDialog,
    decompiling = false,
    decompiler = "cfr",
    decompileAll = true;
  $: rawContent, (decompiling = false);
  const addToCache = (raw, decompiled) => {
    const caches = JSON.parse(localStorage["rr2DecompilationCache"] || "{}");
    caches[hash(raw)] = decompiled;
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
      const endpoint = "ratrater" + (Math.floor(Math.random() * 4) + 1) + ".azurewebsites.net";
      // load balancer lol
      // also see: https://github.com/KTibow/RatRater2Backend
      response = await fetch(`https://${endpoint}/decompile?decompiler=${decompiler}`, {
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
    trailingIcon={iconRefresh}
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
  <p class="m3-font-label-large mb-4">
    <label class="flex items-center gap-2" for={undefined}>
      <Switch bind:checked={decompileAll} /> Decompile whole .jar
    </label>
  </p>
  <details>
    <summary class="font-italic cursor-pointer">Please be patient</summary>
    <p class="mb-2">
      The fact I could run these decompilers without putting any ads on here is crazy.
    </p>
    <p class="mb-2">
      Azure App Services, plus a mix of Docker, Python, Java, and janky load balancing take your
      request and run a Java decompiler for you.
    </p>
    <p class="mb-2">
      Don't overload the servers. Note that a mix of a slow decompiler like Procyon, decompiling the
      whole jar, and a large jar may mean your request doesn't get through in time.
    </p>
    <p class="mb-2">
      This jar has {Object.values(zip.files).filter((f) => !f.dir && f.name.endsWith(".class"))
        .length} classes. So you can understand some expected response times, here's a table. Note that
      different servers may have different response times, especially if they have a cold start.
    </p>
    <table class="border-collapse">
      <tr>
        <td>File</td>
        <td>FernFlower</td>
        <td>QuiltFlower</td>
        <td>Procyon</td>
        <td>CFR</td>
      </tr>
      <tr>
        <td>45-class non-obfuscated jar</td><td>7s</td><td>10s</td><td>13s</td><td>6s</td>
      </tr>
      <tr>
        <td>348-class non-obfuscated jar</td><td>52s</td><td>56s</td>
        <td><a class="text-primary" href="http://http.cat/503">503</a></td><td>30s</td>
      </tr>
      <tr>
        <td>Single obfuscated class</td>
        <td><a class="text-primary" href="http://http.cat/500">500</a></td>
        <td>12s</td><td>20s</td><td>10s</td>
      </tr>
    </table>
  </details>
</Dialog>
{#key decompiling}
  <SnackbarPlacer>
    <Snackbar open={decompiling}>
      Decompiling {decompiling}
    </Snackbar>
  </SnackbarPlacer>
{/key}

<style lang="postcss">
  table > tr > td {
    @apply border border-outline px-2;
  }
</style>
