<script lang="ts">
  import { Chip, Dialog, Radio, Switch, Snackbar, SnackbarPlacer } from "m3-svelte";
  import iconRefresh from "@iconify-icons/ic/outline-refresh";
  import JSZip from "jszip";
  import { hash } from "$lib/hash";
  import { file, type Loaded, view } from "$lib/state";
  import { tick } from "svelte";

  export let contentOut: string | undefined;
  export let contentIn: string | undefined;

  const addToCache = (raw: string, decompiled: string) => {
    const caches = JSON.parse(localStorage["rr2DecompilationCache"] || "{}");
    caches[hash(raw)] = decompiled;
    try {
      localStorage["rr2DecompilationCache"] = JSON.stringify(caches);
    } catch (e) {
      localStorage.removeItem("rr2DecompilationCache");
      console.error("failed to update cache", e);
    }
  };
  let decompiledContent: string | undefined,
    showDecompiled = false;
  $: decompiledContent =
    (contentIn && JSON.parse(localStorage["rr2DecompilationCache"] || "{}")[hash(contentIn)]) ||
    undefined;
  $: contentOut = (showDecompiled && decompiledContent) || undefined;

  let snackbar: { open: boolean; message?: string } = { open: false };
  let dialog = { open: false, decompiler: "cfr", decompileAll: true };
  $: contentIn, (snackbar = { open: false });
  const decompile = async () => {
    snackbar = { open: true, message: "Decompiling..." };
    const form = new FormData(),
      pinnedRaw = contentIn as string,
      pinnedFile = $view.editorFile as string,
      pinnedZip = ($file as Loaded).zip;
    if (dialog.decompileAll) {
      form.set("file", ($file as Loaded).file, "file.jar");
    } else {
      const blob = await ($file as Loaded).zip.files[pinnedFile].async("blob");
      form.set("file", blob, "file.class");
    }

    let response;
    try {
      const endpoint = "ratrater" + (Math.floor(Math.random() * 4) + 1) + ".azurewebsites.net";
      // load balancer lol
      // also see: https://github.com/KTibow/RatRater2Backend
      response = await fetch(`https://${endpoint}/decompile?decompiler=${dialog.decompiler}`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        snackbar = { open: true, message: "Failed to decompile" };
        console.error(response);
        return;
      }
    } catch (e) {
      snackbar = { open: true, message: "Failed to decompile" };
      console.error(e);
      return;
    }
    if (dialog.decompileAll) {
      snackbar = { open: true, message: "Loading decompiled..." };
      await tick();
      const outputZip = await new JSZip().loadAsync(await response.arrayBuffer());
      await Promise.all(
        Object.values(pinnedZip.files).map(async (f) => {
          if (f.dir || !f.name.endsWith(".class")) return;
          const decompiledFile = outputZip.files[f.name.replace(/\.class$/, ".java")];
          if (!decompiledFile) return;
          const [raw, decompiled] = await Promise.all([
            f.async("string"),
            decompiledFile.async("string"),
          ]);
          addToCache(raw, decompiled);
          if (f.name == pinnedFile) {
            decompiledContent = decompiled;
            showDecompiled = true;
          }
        })
      );
    } else {
      decompiledContent = await response.text();
      addToCache(pinnedRaw, decompiledContent);
      showDecompiled = true;
    }
    snackbar = { open: true, message: "Decompiled!" };
  };

  $: classCount = Object.values(($file as Loaded).zip.files).filter(
    (f) => !f.dir && f.name.endsWith(".class")
  ).length;
</script>

{#if decompiledContent}
  <Chip
    type="assist"
    selected={showDecompiled}
    trailingIcon={iconRefresh}
    on:click={() => (showDecompiled = !showDecompiled)}
    on:trailingClicked={() => (dialog.open = true)}
  >
    Decompiled
  </Chip>
{:else}
  <Chip type="assist" on:click={() => (dialog.open = true)}>Decompile</Chip>
{/if}
<Dialog
  bind:open={dialog.open}
  title="Decompile file"
  confirmLabel="Decompile"
  cancelLabel="Cancel"
  on:closed={(e) => {
    if (e.detail.method == "clickConfirm") decompile();
  }}
>
  <p class="m3-font-label-large mb-2">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="forgeflower" bind:group={dialog.decompiler} name="decompiler" /> FernFlower
    </label>
  </p>
  <p class="m3-font-label-large mb-2">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="quiltflower" bind:group={dialog.decompiler} name="decompiler" /> QuiltFlower
    </label>
  </p>
  <p class="m3-font-label-large mb-2">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="procyon" bind:group={dialog.decompiler} name="decompiler" /> Procyon
    </label>
  </p>
  <p class="m3-font-label-large mb-4">
    <label class="flex items-center gap-2" for={undefined}>
      <Radio value="cfr" bind:group={dialog.decompiler} name="decompiler" /> CFR
    </label>
  </p>
  <p class="m3-font-label-large mb-4">
    <label class="flex items-center gap-2" for={undefined}>
      <Switch bind:checked={dialog.decompileAll} /> Decompile whole .jar
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
      This jar has <strong>{classCount} classes</strong>. So you can understand some expected
      response times, here's a table. Note that different servers may have different response times,
      especially if they have a cold start.
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
        <td><a class="underline-hover" href="http://http.cat/503">503</a></td><td>30s</td>
      </tr>
      <tr>
        <td>Single obfuscated class</td>
        <td><a class="underline-hover" href="http://http.cat/500">500</a></td>
        <td>12s</td><td>20s</td><td>10s</td>
      </tr>
    </table>
  </details>
</Dialog>
{#key snackbar}
  <SnackbarPlacer>
    <Snackbar open={snackbar.open}>
      {snackbar.message}
    </Snackbar>
  </SnackbarPlacer>
{/key}

<style lang="postcss">
  table > tr > td {
    @apply border border-outline px-2;
  }
</style>
