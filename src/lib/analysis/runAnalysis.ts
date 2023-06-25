import type JSZip from "jszip";
import type { Writable } from "svelte/store";
import type { Analysis, Progress } from "./createAnalysis";
import type { InitialFind } from "$lib/state";

const prescan = (zip: JSZip & JSZip.JSZipObject, files: string[], state: Analysis) => {
  if (zip.comment) {
    state.obfuscation["Custom zip comment"] = { quote: zip.comment };
  }

  const shorts = [];
  const re = /(\/|^)(.{1,2})\.class$/i;
  for (const file of files) {
    const match = re.exec(file);
    if (match) shorts.push({ file, name: match[2] });
  }
  if (shorts.length > 3) {
    const shortest = shorts.sort((a, b) => a.name.length - b.name.length)[0];
    state.obfuscation["Possible obfuscation (short file names)"] = {
      file: shortest.file,
    };
  }

  const executables = files.filter((file: string) => {
    const n = file.toLowerCase();
    return n.endsWith(".jar") || n.endsWith(".exe") || n.endsWith(".dll");
  });
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
    { name: "DogeRat", pattern: "vytal/should/kill/himself" },
  ];
  for (const f of flags) {
    const match = files.find((file) => file.startsWith(f.pattern));
    if (match) {
      state.flagged = { name: f.name, file: match };
      break;
    }
  }
};

const scan = (file: string, contents: string, state: Analysis) => {
  if (!state.flagged) {
    const quantiyState =
      /\w{43}==\w{43}[_\/\\\-!|I]{13,15}F\w\-\w{7}-\w{7}-\/\/D\w{13}-\w{4}\/\/I\w{3}\-\w{7}\-\w{5}V\/\/E[a-z]\-\w{5}\-\w{5}\-\w{1}C\w{1}R\/\/E.{15}/;
    if (contents.includes("EncryptionMethod1337") || quantiyState.test(contents)) {
      state.flagged = { name: "Quantiy", file };
    }
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
    state.obfuscation["Possibly Skidfuscator (many 15-char functions)"] = { file };
  }
  const matchNoop = contents.match(/\x00/g);
  if (matchNoop && matchNoop.length > 10000 && matchNoop.length > contents.length / 3) {
    state.obfuscation["Possibly Skidfuscator (many noops)"] = { file };
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
  { zip, data, files }: { zip: JSZip & JSZip.JSZipObject; data: ArrayBuffer; files: string[] },
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

  const apiAnalysisTask = async () => {
    const resp = await fetch("https://rr-quantiy.ktibow.workers.dev/", {
      body: data,
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    if (!resp.ok) {
      console.error(await resp.text());
      throw new Error("API analysis failed");
    }
    const json = await resp.json();
    if (!state.flagged) {
      if (json.class == "sure") {
        state.flagged = { name: "Quantiy" };
      } else if (json.class == "maybe") {
        state.flagged = { name: "Quantiy (low confidence)" };
      }
    }
  };
  tasks.push(apiAnalysisTask());

  const catchTask = (e: Error) => {
    console.error("While scanning,", e);
  };
  const afterTask = () => {
    done++;
    progress.set({ done, total: tasks.length });
  };
  await Promise.all(tasks.map((task) => task.catch(catchTask).finally(afterTask)));
};
