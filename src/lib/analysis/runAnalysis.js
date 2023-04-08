import { tick } from "svelte";
import { runAnalysis as flag } from "ralp";

const obfuscationFlags = {
  "Possible obfuscation (many short file names)": {
    path: ["(\\/|^).{1,2}\\.class$", "i"],
    minFiles: 3,
  },
  "Non-scanned executable files": {
    path: ["(\\/|^).+\\.(jar|exe|dll)$", "i"],
  },
  "Obfuscator Bozar": {
    path: ["(?=[Il]{9,})(?:(?:I+l+)+I+)", "i"],
    file: ["(?=[Il]{9,})(?:(?:I+l+)+I+)", "i"],
    find: { searchString: "(?=[Il]{9,})(?:(?:I+l+)+I+)", isRegex: true },
  },
  "Obfuscator Branchlock": {
    path: ["branchlock", "i"],
    file: ["branchlock", "i"],
    find: { searchString: "branchlock", isRegex: true },
  },
  "Obfuscator Skidfuscator": {
    file: ["nothing_to_see_here|thisIsAInsaneEncryptionMethod", "i"],
    find: { searchString: "nothing_to_see_here|thisIsAInsaneEncryptionMethod", isRegex: true },
  },
};
export const runAnalysis = async (file, analysisStore, progressStore) => {
  await flag(file, obfuscationFlags, null, analysisStore.set, progressStore.set);
};
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
