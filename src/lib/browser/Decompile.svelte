<script lang="ts">
  import iconMenu from "@iconify-icons/ic/outline-more-vert";
  import iconCode from "@iconify-icons/ic/outline-code";
  import iconFile from "@iconify-icons/ic/outline-description";
  import iconPlay from "@iconify-icons/ic/outline-play-arrow";
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
    easeEmphasized,
    easeEmphasizedDecel,
  } from "m3-svelte";
  import type { SnackbarIn } from "m3-svelte/package/containers/Snackbar.svelte";

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

  let show: (data: SnackbarIn) => void;
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
    show({ message: "Decompiling..." });
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
        show({ message: "Failed to decompile" });
        console.error(response);
        return;
      }
    } catch (e) {
      show({ message: "Failed to decompile" });
      console.error(e);
      return;
    }

    if (decompileScope == "all") {
      show({ message: "Loading decompiled..." });
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
    show({ message: "Decompiled!" });
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
  <Button type="text" iconType="full" on:click={() => (menuOpen = !menuOpen)}>
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
          <MenuItem icon={iconCode} on:click={() => ((showDecompiled = false), (menuOpen = false))}>
            Raw
          </MenuItem>
        {:else if decompiledContent}
          <MenuItem icon={iconFile} on:click={() => ((showDecompiled = true), (menuOpen = false))}>
            Decompiled
          </MenuItem>
        {/if}
        <MenuItem icon={iconPlay} on:click={openDialog}>Start decompiling</MenuItem>
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
  <svelte:fragment slot="buttons">
    <Button
      type="text"
      on:click={() => {
        dialogOpen = false;
        hotServer = undefined;
      }}
    >
      Cancel
    </Button>
    <Button type="text" on:click={runDecompile}>Decompile</Button>
  </svelte:fragment>
</Dialog>
<Snackbar bind:show />

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
