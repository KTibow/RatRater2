<script>
  import Folder from "./Folder.svelte";
  import Chooser from "$lib/Panel/Chooser.svelte";
  import Button from "../Button.svelte";

  export let activeFile;
  export let activeFileName;
  export let activePath;

  const createTree = (files) => {
    const tree = {};
    Object.values(files).forEach((file) => {
      const parts = file.name.split("/");
      parts.reduce((section, name, index) => {
        if (!name) return section;
        if (!section[name])
          section[name] = index == parts.length - 1 ? file : { "is/folder": true }; // weird name for security
        return section[name];
      }, tree);
    });
    return tree;
  };
  const reduceTree = (tree) => {
    let couldReduce;
    Object.entries(tree).forEach(([name, contents]) => {
      if (name == "is/folder") return;
      const items = Object.keys(contents).filter((name) => name != "is/folder");
      if (contents["is/folder"]) {
        if (items.length == 1) {
          couldReduce = true;
          delete tree[name];
          tree[name + "/" + items[0]] = contents[items[0]];
        } else {
          tree[name] = reduceTree(contents);
        }
      }
    });
    if (couldReduce) reduceTree(tree);
    return tree;
  };
  let tree;
  $: {
    if (!activeFile) break $;
    tree = reduceTree(createTree(activeFile.files));
    console.log("tree", tree);
  }
</script>

{#if activeFile}
  <div class="flex max-h-screen flex-shrink-0 flex-col overflow-scroll bg-neutral-900 p-4 lg:w-1/4">
    <Folder folder={tree} name={activeFileName} open={true} bind:activePath />
    <div class="mt-auto flex gap-4">
      <Button styling="flex-grow p-6">Deobfuscate...</Button>
      <Chooser bind:activeFile bind:activeFileName altButton={true} />
    </div>
  </div>
{/if}
