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
    check: (contents) => /(?=[Il]{9,})(?:(?:I+l+)+I+)/i.test(contents),
    find: { searchString: "(?=[Il]{9,})(?:(?:I+l+)+I+)", isRegex: true },
  },
  "Obfuscator Branchlock": {
    path: ["branchlock", "i"],
    check: (contents) => contents.toLowerCase().includes("branchlock"),
    find: { searchString: "branchlock", isRegex: true },
  },
  "Obfuscator Skidfuscator": {
    check: (contents) =>
      contents.includes("nothing_to_see_here") ||
      contents.includes("thisIsAInsaneEncryptionMethod"),
    find: { searchString: "nothing_to_see_here|thisIsAInsaneEncryptionMethod", isRegex: true },
  },
  "Obfuscator Stringer": {
    check: (contents) => /\p{Script=Han}{5}/u.test(contents) && contents.includes("reflect"),
  },
};
const mainFlags = {
  "Uses session token": {
    check: (contents) => contents.includes("func_111286_b") || contents.includes("func_148254_d"),
    link: "https://github.com/KTibow/RatRater2/wiki/Flags#func_111286_b--func_148254_d",
    find: { searchString: "func_111286_b|func_148254_d", isRegex: true },
  },
  "Gets your IP address": {
    check: (contents) =>
      /https?:\/\/checkip\.amazonaws\.com/i.test(contents) ||
      contents.includes("api.myip.com") ||
      contents.includes("whatismyip"),
    link: "https://github.com/KTibow/RatRater2/wiki/Flags#ip-addresses",
    find: {
      searchString: String.raw`https?:\/\/checkip\.amazonaws\.com|api.myip.com|whatismyip`,
      isRegex: true,
    },
  },
};
export const runAnalysis = async (file, analysisStore, progressStore) => {
  await flag(file, obfuscationFlags, mainFlags, analysisStore.set, progressStore.set);
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
