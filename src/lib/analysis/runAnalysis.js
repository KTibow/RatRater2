import { tick } from "svelte";

const shortFileMatcher = /(\/|^).{1,2}\.class$/i;
const executableMatcher = /(\/|^).+\.(jar|exe|dll)$/i;
const obfuscators = [
  { name: "Bozar", regex: /(?=[Il]{9,})(?:(?:I+l+)+I+)/i },
  { name: "Branchlock", regex: /branchlock/i },
  {
    name: "Skidfuscator",
    regex: /nothing_to_see_here|thisIsAInsaneEncryptionMethod/i,
  },
];
export const runAnalysis = async (file, analysis, progress) => {
  const shortFiles = file.files.filter((f) => shortFileMatcher.test(f));
  const executableFiles = file.files.filter((f) => executableMatcher.test(f));

  const addObfIfNotPresent = (flag) =>
    analysis.update((a) => {
      const obfuscation = a.obfuscation;
      if (!obfuscation.some((o) => o.name == flag.name)) obfuscation.push(flag);
      return a;
    });
  const addFlag = (flag) =>
    analysis.update((a) => {
      const flags = a.flags;
      const flagEntry = flags.find((f) => f.name == flag.name);
      if (flagEntry) flagEntry.matches.push(...flag.matches);
      else flags.push(flag);
      return a;
    });
  const obfuscationFlags = [];
  if (shortFiles.length > 2)
    obfuscationFlags.push({
      name: "Possible obfuscation (many short file names)",
      file: shortFiles[0],
    });
  if (executableFiles.length > 0)
    obfuscationFlags.push({ name: "Non-scanned executable files", file: executableFiles[0] });
  analysis.update((a) => ({ ...a, obfuscation: obfuscationFlags }));
  file.files.map((f) => {
    obfuscators.forEach((obf) => {
      if (obf.regex.test(f))
        addObfIfNotPresent({
          name: "Obfuscator " + obf.name,
          file: f,
          find: { searchString: obf.regex.source, isRegex: true, matchCase: !obf.regex.ignoreCase },
        });
    });
  });
  await tick();

  const filesToCheck = file.files.filter(
    (path) => /manifest\.mf$/i.test(path) || path.endsWith(".class")
  );
  progress.set({ done: 0, total: filesToCheck.length });
  await Promise.all(
    filesToCheck.map((p) => processFile(p, file.zip, progress, addObfIfNotPresent, addFlag))
  );
  // todo: cache results
};
const processFile = async (path, zip, progress, addObf, addFlag) => {
  const thisFile = zip.files[path];
  const contents = await thisFile.async("string");
  if (/manifest\.mf$/i.test(path)) {
    const protectedLine = contents.match(/^(?=.*protected).*$/im);
    if (protectedLine)
      addObf({
        name: "Obfuscator noted in manifest.mf",
        example: protectedLine.join("\n"),
      });
    progress.update((p) => ({ ...p, done: p.done + 1 }));
    return;
  }
  obfuscators.forEach((obf) => {
    if (obf.regex.test(contents))
      addObf({
        name: "Obfuscator " + obf.name,
        file: path,
        find: {
          searchString: obf.regex.source,
          isRegex: true,
          matchCase: !obf.regex.ignoreCase,
        },
      });
  });
  if (/\p{Script=Han}{5}/u.test(contents) && contents.includes("reflect"))
    addObf({
      name: "Obfuscator Stringer",
      file: path,
      find: { searchString: "reflect" },
    });

  if (contents.includes("func_111286_b") || contents.includes("func_148254_d"))
    addFlag({
      name: "Uses session token",
      matches: [path],
      link: "https://github.com/KTibow/RatRater2/wiki/Flags#func_111286_b--func_148254_d",
      find: { searchString: "func_111286_b|func_148254_d", isRegex: true },
    });
  if (
    /https?:\/\/checkip\.amazonaws\.com/i.test(contents) ||
    contents.includes("api.myip.com") ||
    contents.includes("whatismyip")
  )
    addFlag({
      name: "Gets your IP address",
      matches: [path],
      link: "https://github.com/KTibow/RatRater2/wiki/Flags#ip-addresses",
      find: {
        searchString: String.raw`https?:\/\/checkip\.amazonaws\.com|api.myip.com|whatismyip`,
        isRegex: true,
      },
    });

  progress.update((p) => ({ ...p, done: p.done + 1 }));
  await tick();
};
