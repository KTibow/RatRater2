import { writable } from "svelte/store";
import { runAnalysis } from "./runAnalysis";

const CACHE_VER = "0";
export const createAnalysis = ({ zip, hash }) => {
  const files = Object.values(zip.files)
    .filter((f) => !f.dir)
    .map((f) => f.name);
  const analysis = writable({ obfuscation: [] });
  const progress = writable({ done: 0, total: 1 });

  const cache = JSON.parse(localStorage["rr2AnalysisCache" + CACHE_VER] || "{}")[hash];
  if (cache) {
    analysis.set(cache);
    progress.set({ done: 1, total: 1 });
  } else runAnalysis({ zip, hash, files }, analysis, progress);

  return { analysis, progress };
};
