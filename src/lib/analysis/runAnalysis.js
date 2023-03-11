import { testMatch } from "ralp";
import obfuscation from "./obfuscation.json";
/**
 *
 * @param {{ zip: import("jszip"), hash: string, files: string[] }} file
 * @param {import("svelte/store").Writable<{ obfuscation: {[id: string]: any}, flags: any[] }>} analysisStore
 * @param {import("svelte/store").Writable<{ done: number, total: number }>} progressStore
 */
export const runAnalysis = async (file, analysisStore, progressStore) => {};
/*
[
  {
    "data": { "name": "Possible obfuscation (many short file names)", "minMatches": 3 },
    "match": {
      "type": "path",
      "regex": ["(\\/|^).{1,2}\\.class$", "i"]
    }
  }
]
*/
