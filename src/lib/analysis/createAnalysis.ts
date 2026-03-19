import { get, writable } from "svelte/store";
import { file, type InitialFind, type Loaded } from "$lib/state";
import runAnalysis from "./runAnalysis";

export const createAnalysis = () => {
  const fileData = get(file) as Loaded;
  const entries = fileData.entries;
  const data = fileData.data;
  const files = entries.map((entry) => entry.filename);
  const analysis = writable<Analysis>({ obfuscation: {}, flags: {} });
  const progress = writable<Progress>({ done: 0, total: 1 });

  runAnalysis({ comment: fileData.comment, entries, data, files }, analysis, progress);

  return { analysis, progress };
};
export type Analysis = {
  obfuscation: Record<
    string,
    { file: string; initialFind?: InitialFind } | { quote: string; initialFind?: InitialFind }
  >;
  flags: Record<string, Flag>;
  flagged?: { name: string; file?: string };
};
export type Obfuscation = [
  string,
  { file: string; initialFind?: InitialFind } | { quote: string; initialFind?: InitialFind },
][];
export type Flag = { matches: string[]; link?: string; initialFind: InitialFind };

export type Progress = {
  done: number;
  total: number;
};
