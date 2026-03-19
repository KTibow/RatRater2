<script lang="ts">
  import { BlobReader, BlobWriter, TextWriter, ZipReader } from "@zip.js/zip.js";
  import iconMenu from "@ktibow/iconset-ic/outline-more-vert";
  import iconCode from "@ktibow/iconset-ic/outline-code";
  import iconFile from "@ktibow/iconset-ic/outline-description";
  import iconPlay from "@ktibow/iconset-ic/outline-play-arrow";
  import { Icon } from "m3-svelte";
  import { tick } from "svelte";
  import { fade, slide } from "svelte/transition";
  import {
    Button,
    Dialog,
    Menu,
    MenuItem,
    Snackbar,
    easeEmphasized,
    easeEmphasizedDecel,
  } from "m3-svelte";

  import { arrayBufferToBinaryString } from "$lib/binaryString";
  import { hash } from "$lib/hash";
  import { file, view, type Loaded } from "$lib/state";
  import {
    hasEntryData,
    isClassPath,
    stripTrailingSlash,
    type LoadedEntry,
  } from "$lib/zipEntries";

  export let contentIn: string | undefined;
  export let contentOut: string | undefined;

  let decompiledContent: string | undefined;
  let showDecompiled = false;
  $: decompiledContent = contentIn
    ? JSON.parse(localStorage["rr2DecompilationCache"] || "{}")[hash(contentIn)] || undefined
    : undefined;
  $: contentOut = (showDecompiled && decompiledContent) || undefined;

  const decompileMethods = [
    { id: "forgeflower-single", text: "FernFlower\n(.class)" },
    { id: "quiltflower-single", text: "QuiltFlower\n(.class)" },
    { id: "procyon-single", text: "Procyon\n(.class)" },
    { id: "cfr-single", text: "CFR\n(.class)" },
    { id: "forgeflower-all", text: "FernFlower\n(.jar)" },
    { id: "quiltflower-all", text: "QuiltFlower\n(.jar)" },
    { id: "procyon-all", text: "Procyon\n(.jar)" },
    { id: "cfr-all", text: "CFR\n(.jar)" },
  ];
  let dialogOpen = false;
  let decompileMethod = "cfr-single";
  let hotServer: string | undefined;
  const openDialog = () => {
    dialogOpen = true;
    menuOpen = false;
    hotServer = "https://ratrater" + Math.ceil(Math.random() * 3) + ".azurewebsites.net";
    fetch(hotServer);
  };

  let snackbar: ReturnType<typeof Snackbar>;
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
  const getEntry = (entries: LoadedEntry[], path: string) =>
    entries.find((entry) => entry.filename === path || entry.filename === "/" + path);
  const getJavaCandidates = (path: string) => {
    const javaPath = stripTrailingSlash(path).replace(/\.class$/i, ".java");
    return path.endsWith("/") ? [javaPath, javaPath + "/"] : [javaPath];
  };
  const runDecompile = async () => {
    snackbar.show({ message: "Decompiling..." });
    const form = new FormData(),
      server = hotServer,
      decompiler = decompileMethod.split("-")[0],
      decompileScope = decompileMethod.split("-")[1],
      pinnedRaw = contentIn as string,
      pinnedFile = $view.editorFile as string,
      pinnedEntries = ($file as Loaded).entries;
    dialogOpen = false;
    hotServer = undefined;

    if (decompileScope == "all") {
      form.set("file", ($file as Loaded).file, "file.jar");
    } else {
      const entry = getEntry(pinnedEntries, pinnedFile);
      if (!entry) {
        snackbar.show({ message: "Failed to decompile" });
        return;
      }
      const blob = await entry.getData(new BlobWriter());
      form.set("file", blob, "file.class");
    }

    let response;
    try {
      response = await fetch(`${server}/decompile?decompiler=${decompiler}`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        snackbar.show({ message: "Failed to decompile" });
        console.error(response);
        return;
      }
    } catch (e) {
      snackbar.show({ message: "Failed to decompile" });
      console.error(e);
      return;
    }

    if (decompileScope == "all") {
      snackbar.show({ message: "Loading decompiled..." });
      await tick();
      const outputZip = new ZipReader(new BlobReader(await response.blob()));
      try {
        const outputEntries = (await outputZip.getEntries()).filter(
          hasEntryData,
        );
        const outputEntriesByName = new Map(
          outputEntries.map((entry) => [entry.filename, entry]),
        );

        await Promise.all(
          pinnedEntries.map(async (entry) => {
            if (!isClassPath(entry.filename)) return;
            const decompiledFile = getJavaCandidates(entry.filename)
              .map((candidate) => outputEntriesByName.get(candidate))
              .find(Boolean);
            if (!decompiledFile) return;
            const [rawData, decompiled] = await Promise.all([
              entry.arrayBuffer(),
              decompiledFile.getData(new TextWriter()),
            ]);
            const raw = arrayBufferToBinaryString(rawData);
            addToCache(raw, decompiled);
            if (entry.filename == pinnedFile) {
              decompiledContent = decompiled;
              showDecompiled = true;
            }
          }),
        );
      } finally {
        await outputZip.close().catch(() => {});
      }
    } else {
      decompiledContent = await response.text();
      addToCache(pinnedRaw, decompiledContent);
      showDecompiled = true;
    }
    snackbar.show({ message: "Decompiled!" });
  };

  let menuOpen = false;
</script>

<div class="relative flex">
  <Button variant="text" iconType="full" onclick={() => (menuOpen = !menuOpen)}>
    <Icon icon={iconMenu} />
  </Button>
  {#if menuOpen}
    <div
      class="absolute top-full right-0 z-10"
      in:slide={{ duration: 400, easing: easeEmphasizedDecel }}
      out:fade={{ duration: 300, easing: easeEmphasized }}
    >
      <Menu>
        {#if decompiledContent && showDecompiled}
          <MenuItem icon={iconCode} onclick={() => ((showDecompiled = false), (menuOpen = false))}>
            Raw
          </MenuItem>
        {:else if decompiledContent}
          <MenuItem icon={iconFile} onclick={() => ((showDecompiled = true), (menuOpen = false))}>
            Decompiled
          </MenuItem>
        {/if}
        <MenuItem icon={iconPlay} onclick={openDialog}>Start decompiling</MenuItem>
      </Menu>
    </div>
  {/if}
</div>
<Dialog bind:open={dialogOpen} headline="Start decompiling">
  <div class="grid grid-cols-4 gap-2">
    {#each decompileMethods as method}
      <input
        type="radio"
        name="decompile-method"
        value={method.id}
        id="decompile-method-{method.id}"
        bind:group={decompileMethod}
      />
      <label for="decompile-method-{method.id}">
        {method.text.split("\n")[0]}<br />{method.text.split("\n")[1]}
      </label>
    {/each}
  </div>
  {#snippet buttons()}
    <Button
      variant="text"
      onclick={() => {
        dialogOpen = false;
        hotServer = undefined;
      }}
    >
      Cancel
    </Button>
    <Button variant="text" onclick={runDecompile}>Decompile</Button>
  {/snippet}
</Dialog>
<Snackbar bind:this={snackbar} />

<style>
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  label {
    padding: 0.5rem 0.6rem;
    border-radius: 1.2rem;
    background-color: rgb(var(--m3-scheme-background));
    color: rgb(var(--m3-scheme-on-background));
    cursor: pointer;
    transition: all 200ms;
  }
  input:checked + label {
    background-color: rgb(var(--m3-scheme-primary-container));
    color: rgb(var(--m3-scheme-on-primary-container));
    border-radius: 0.5rem;
  }
</style>
