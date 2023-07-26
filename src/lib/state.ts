import JSZip from "jszip";
import { tick } from "svelte";
import { writable } from "svelte/store";

export type InitialFind = {
  searchString: string;
  isRegex?: boolean;
  wholeWord?: boolean;
  matchCase?: boolean;
};
export type Loaded = { state: "loaded"; file: File; data: ArrayBuffer; zip: JSZip; hash: string };
export const file = writable<
  { state?: never } | { state: "loading"; file: File } | Loaded | { state: "error"; file: File }
>({});
export const view = writable<{
  tab: "analysis" | "browser";
  editorFile?: string;
  editorFind?: InitialFind;
}>({
  tab: "analysis",
});
export const loadFile = async (newFile: File) => {
  file.set({ state: "loading", file: newFile });
  await tick();
  const reader = new FileReader();
  reader.readAsArrayBuffer(newFile);
  reader.addEventListener("load", async () => {
    const data = reader.result;
    if (!(data instanceof ArrayBuffer)) return;
    try {
      const [zip, hashBytes] = await Promise.all([
        new JSZip().loadAsync(data),
        crypto.subtle.digest("SHA-256", data),
      ]);
      const hash = [...new Uint8Array(hashBytes)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const status: Loaded = { state: "loaded", file: newFile, data, zip, hash };
      console.log(status);
      file.set(status);
    } catch (e) {
      file.set({ state: "error", file: newFile });
    }
  });
};
