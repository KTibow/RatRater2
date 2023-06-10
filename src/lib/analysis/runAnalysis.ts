import type JSZip from "jszip";
import type { Writable } from "svelte/store";
import type { Analysis, Progress } from "./createAnalysis";
import type { InitialFind } from "$lib/state";

const prescan = (zip: JSZip & JSZip.JSZipObject, files: string[], state: Analysis) => {
  if (zip.comment) {
    state.obfuscation["Custom zip comment"] = { quote: zip.comment };
  }

  const shorts = files
    .map((file: string) => ({ file, match: file.match(/(\/|^)(.{1,2})\.class$/i) }))
    .filter((m) => m.match) as { file: string; match: RegExpMatchArray }[];
  if (shorts.length > 3) {
    const shortest = shorts.sort((a, b) => a.match[1].length - b.match[1].length)[0];
    state.obfuscation["Possible obfuscation (short file names)"] = { file: shortest.file };
  }

  const executables = files.filter((file: string) => /\.(jar|exe|dll)$/i.test(file));
  if (executables.length > 0) {
    state.obfuscation["Non-scanned executable files"] = {
      file: executables[0],
    };
  }

  const bozar = files.find((file: string) => /(?=[Il]{9,})(?:(?:I+l+)+I+)/.test(file));
  if (bozar) state.obfuscation["Obfuscator Bozar"] = { file: bozar };
  const branchlock = files.find((file: string) => file.toLowerCase().includes("branchlock"));
  if (branchlock) state.obfuscation["Obfuscator Branchlock"] = { file: branchlock };

  const flags = [
    { name: "Kodeine", pattern: "a/b/c/d" },
    { name: "Yoink", pattern: "net/jodah/typetools" },
    { name: "CustomPayload Normal", pattern: "me/custompayload/normal" },
    { name: "SBFT", pattern: "com/sbft" },
    { name: "MacroMod", pattern: "com/macromod" },
    { name: "Quanity", pattern: "com/quantiy" },
  ];
  for (const f of flags) {
    const match = files.find((file) => file.startsWith(f.pattern));
    if (match) {
      state.flagged = { name: f.name, file: match };
      break;
    }
  }
  if (!state.flagged) {
    const classes = files.filter((f) => f.endsWith(".class"));
    const quantiyR = /^[a-z]{9}\/[a-z]{9}\/[a-z]{9}.class$/;
    if (classes.length == 1 && quantiyR.test(classes[0])) {
      state.flagged = { name: "Quanity", file: classes[0] };
    }
  }
};

const scan = (file: string, contents: string, state: Analysis) => {
  if (!state.flagged && contents.includes("EncryptionMethod1337")) {
    state.flagged = { name: "Quantiy", file };
  }
  if (/(?=[Il]{9,})(?:(?:I+l+)+I+)/.test(contents)) {
    state.obfuscation["Obfuscator Bozar"] = {
      file,
      initialFind: { searchString: "(?=[Il]{9,})(?:(?:I+l+)+I+)", isRegex: true },
    };
  }
  if (contents.toLowerCase().includes("branchlock")) {
    state.obfuscation["Obfuscator Branchlock"] = {
      file,
      initialFind: { searchString: "branchlock", isRegex: true },
    };
  }
  if (
    contents.includes("nothing_to_see_here") ||
    contents.includes("thisIsAInsaneEncryptionMethod") ||
    contents.includes("EncryptionMethod1337")
  ) {
    state.obfuscation["Obfuscator Skidfuscator"] = {
      file,
      initialFind: {
        searchString: "nothing_to_see_here|thisIsAInsaneEncryptionMethod|EncryptionMethod1337",
        isRegex: true,
      },
    };
  }
  const match15 = contents.match(/[^a-z][a-z]{15}[^a-z]/g);
  if (match15 && match15.length > 10) {
    state.obfuscation["Possible obfuscation (many 15-char functions)"] = { file };
  }
  const matchNoop = contents.match(/\x00/g);
  if (matchNoop && matchNoop.length > 10000 && matchNoop.length > contents.length / 3) {
    state.obfuscation["Possible obfuscation (many noops)"] = { file };
  }
  if (contents.includes("reflect") && /\p{Script=Han}{5}/u.test(contents)) {
    state.obfuscation["Obfuscator Stringer"] = { file };
  }

  const addFlag = (name: string, data: { link?: string; initialFind: InitialFind }) => {
    if (state.flags[name]) {
      state.flags[name].matches.push(file);
    }
    state.flags[name] = {
      matches: [file],
      ...data,
    };
  };
  if (contents.includes("func_111286_b") || contents.includes("func_148254_d")) {
    addFlag("Uses session token", {
      link: "https://github.com/KTibow/RatRater2/wiki/Flags#func_111286_b--func_148254_d",
      initialFind: { searchString: "func_111286_b|func_148254_d", isRegex: true },
    });
  }
  if (
    /https?:\/\/checkip\.amazonaws\.com/i.test(contents) ||
    contents.includes("api.myip.com") ||
    contents.includes("whatismyip")
  ) {
    addFlag("Gets your IP address", {
      link: "https://github.com/KTibow/RatRater2/wiki/Flags#ip-addresses",
      initialFind: {
        searchString: String.raw`https?:\/\/checkip\.amazonaws\.com|api.myip.com|whatismyip`,
        isRegex: true,
      },
    });
  }
  if (
    contents.includes(String.raw`\Google\Chrome\User Data\Default`) ||
    contents.includes("essential/microsoft_accounts.json") ||
    contents.includes(".lunarclient/settings/game/accounts.json") ||
    contents.includes(".feather/accounts.json")
  ) {
    addFlag("File access", {
      link: "https://github.com/KTibow/RatRater2/wiki/Flags#file-access",
      initialFind: {
        searchString: String.raw`\\Google\\Chrome\\User Data\\Default|essential/microsoft_accounts.json|.lunarclient/settings/game/accounts.json`,
        isRegex: true,
      },
    });
  }
  if (contents.includes("Skidfuscator Anti-Abuse")) {
    addFlag("Skidfuscator warning", {
      link: "https://github.com/KTibow/RatRater2/wiki/Flags#skidfuscator-warning",
      initialFind: { searchString: "Skidfuscator Anti-Abuse" },
    });
  }
};
export default async (
  { zip, files }: { zip: JSZip & JSZip.JSZipObject; files: string[] },
  analysis: Writable<Analysis>,
  progress: Writable<Progress>
) => {
  const state: Analysis = { obfuscation: {}, flags: {} };
  const propagate = () => analysis.set(state);
  let done = 0;

  try {
    prescan(zip, files, state);
    propagate();
  } catch (e) {
    console.error("While prescanning", e);
  }

  const tasks = files
    .filter((path) => path.endsWith(".class"))
    .map(async (f) => {
      const contents = await zip.files[f].async("string");
      scan(f, contents, state);
      propagate();
    });

  const manifest = files.find((f) => /manifest\.mf$/i.test(f));
  const manifestTask = async (manifest: string) => {
    const contents = await zip.files[manifest].async("string");
    const protectedLine = contents.match(/^(?=.*protected).*$/im);
    if (!protectedLine) return;
    state.obfuscation["Obfuscator noted in manifest.mf"] = {
      file: manifest,
      initialFind: {
        searchString: "^(?=.*protected).*$",
        isRegex: true,
        wholeWord: false,
        matchCase: false,
      },
    };
    propagate();
  };
  if (manifest) tasks.push(manifestTask(manifest));

  const catchTask = (e: Error) => {
    console.error("While scanning,", e);
  };
  const afterTask = () => {
    done++;
    progress.set({ done, total: tasks.length });
  };
  await Promise.all(tasks.map((task) => task.catch(catchTask).finally(afterTask)));
};
