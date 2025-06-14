<script lang="ts">
  import iconMenu from "@ktibow/iconset-ic/outline-more-vert";
  import iconCode from "@ktibow/iconset-ic/outline-code";
  import iconFile from "@ktibow/iconset-ic/outline-description";
  import iconPlay from "@ktibow/iconset-ic/outline-play-arrow";
  import Icon from "@iconify/svelte";
  import JSZip from "jszip";
  import { tick } from "svelte";
  import { fade, slide } from "svelte/transition";
  import {
    Button,
    Dialog,
    Menu,
    MenuItem,
    Snackbar,
    type SnackbarIn,
    easeEmphasized,
    easeEmphasizedDecel,
  } from "m3-svelte";

  import { hash } from "$lib/hash";
  import { file, view, type Loaded } from "$lib/state";

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
  const runDecompile = async () => {
    snackbar.show({ message: "Decompiling..." });
    const form = new FormData(),
      server = hotServer,
      decompiler = decompileMethod.split("-")[0],
      decompileScope = decompileMethod.split("-")[1],
      pinnedRaw = contentIn as string,
      pinnedFile = $view.editorFile as string,
      pinnedZip = ($file as Loaded).zip;
    dialogOpen = false;
    hotServer = undefined;

    if (decompileScope == "all") {
      form.set("file", ($file as Loaded).file, "file.jar");
    } else {
      const blob = await ($file as Loaded).zip.files[pinnedFile].async("blob");
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
        }),
      );
    } else {
      decompiledContent = await response.text();
      addToCache(pinnedRaw, decompiledContent);
      showDecompiled = true;
    }
    snackbar.show({ message: "Decompiled!" });
  };

  let menuOpen = false;
  let classCount = 0;
  $: {
    const hasZip = "zip" in $file;
    if (!hasZip) break $;
    const fileObj = ($file as Loaded).zip.files;
    classCount = Object.values(fileObj).filter((f) => !f.dir && f.name.endsWith(".class")).length;
  }
</script>

<div class="relative flex">
  <Button variant="text" iconType="full" click={() => (menuOpen = !menuOpen)}>
    <Icon icon={iconMenu} />
  </Button>
  {#if menuOpen}
    <div
      class="absolute right-0 top-full z-10"
      in:slide={{ duration: 400, easing: easeEmphasizedDecel }}
      out:fade={{ duration: 300, easing: easeEmphasized }}
    >
      <Menu>
        {#if decompiledContent && showDecompiled}
          <MenuItem icon={iconCode} click={() => ((showDecompiled = false), (menuOpen = false))}>
            Raw
          </MenuItem>
        {:else if decompiledContent}
          <MenuItem icon={iconFile} click={() => ((showDecompiled = true), (menuOpen = false))}>
            Decompiled
          </MenuItem>
        {/if}
        <MenuItem icon={iconPlay} click={openDialog}>Start decompiling</MenuItem>
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
      click={() => {
        dialogOpen = false;
        hotServer = undefined;
      }}
    >
      Cancel
    </Button>
    <Button variant="text" click={runDecompile}>Decompile</Button>
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
