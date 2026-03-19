import { BlobReader, ZipReader } from "@zip.js/zip.js";
import { tick } from "svelte";
import { writable } from "svelte/store";
import { hasEntryData, type LoadedEntry } from "$lib/zipEntries";

export type InitialFind = {
  searchString: string;
  isRegex?: boolean;
  wholeWord?: boolean;
  matchCase?: boolean;
};
export type Loaded = {
  state: "loaded";
  file: File;
  data: ArrayBuffer;
  zip: ZipReader<Blob>;
  entries: LoadedEntry[];
  comment?: string;
  hash: string;
};
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
let activeZip: ZipReader<Blob> | undefined;

export const loadFile = async (newFile: File) => {
  file.set({ state: "loading", file: newFile });
  await tick();
  const reader = new FileReader();
  reader.readAsArrayBuffer(newFile);
  reader.addEventListener("load", async () => {
    const data = reader.result;
    if (!(data instanceof ArrayBuffer)) return;

    let zip: ZipReader<Blob> | undefined;
    try {
      await activeZip?.close().catch(() => {});
      zip = new ZipReader(new BlobReader(newFile));
      const [entries, hashBytes] = await Promise.all([
        zip.getEntries(),
        crypto.subtle.digest("SHA-256", data),
      ]);
      const hash = [...new Uint8Array(hashBytes)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const status: Loaded = {
        state: "loaded",
        file: newFile,
        data,
        zip,
        entries: entries.filter(hasEntryData),
        comment: zip.comment.length ? new TextDecoder().decode(zip.comment) : undefined,
        hash,
      };
      activeZip = zip;
      file.set(status);
    } catch (e) {
      await zip?.close().catch(() => {});
      file.set({ state: "error", file: newFile });
    }
  });
};
