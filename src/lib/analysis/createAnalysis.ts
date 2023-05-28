import type JSZip from "jszip";
import type { JSZipObject } from "jszip";
import { get, writable } from "svelte/store";
import { file, type InitialFind, type Loaded } from "$lib/state";
import runAnalysis from "./runAnalysis";

export const createAnalysis = () => {
  const zip = (get(file) as Loaded).zip as JSZip & JSZipObject;
  const files = Object.values(zip.files)
    .filter((f) => !f.dir)
    .map((f) => f.name);
  const analysis = writable<Analysis>({ obfuscation: {}, flags: {} });
  const progress = writable<Progress>({ done: 0, total: 1 });

  runAnalysis({ zip, files }, analysis, progress);

  return { analysis, progress };
};
export type Analysis = {
  obfuscation: Record<
    string,
    { file: string; initialFind?: InitialFind } | { quote: string; initialFind?: InitialFind }
  >;
  flags: Record<string, Flag>;
  flagged?: { name: string; file: string };
};
export type Obfuscation = [
  string,
  { file: string; initialFind: InitialFind } | { quote: string; initialFind: InitialFind }
][];
export type Flag = { matches: string[]; link?: string; initialFind: InitialFind };

export type Progress = {
  done: number;
  total: number;
};
