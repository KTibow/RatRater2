import type { Entry, FileEntry } from "@zip.js/zip.js";

export type LoadedEntry = Entry & Pick<FileEntry, "getData" | "arrayBuffer">;

export const hasEntryData = (entry: Entry): entry is LoadedEntry =>
  !entry.directory || entry.uncompressedSize > 0 || entry.compressedSize > 0;

export const isClassPath = (path: string) => /\.class\/?$/i.test(path);

export const stripTrailingSlash = (path: string) =>
  path.endsWith("/") ? path.slice(0, -1) : path;
