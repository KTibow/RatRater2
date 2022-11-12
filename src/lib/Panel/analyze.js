import { writable } from "svelte/store";
import { flags } from "./matchers";

export const analyze = (zip) => {
  const files = Object.values(zip.files).filter((f) => !f.dir);
  const analysis = writable({});
  const meta = writable({ total: files.length, matched: 0, read: 0 });
  files.forEach(async (file) => {
    const fileData = await file.async("string");
    meta.update((dat) => {
      dat.read++;
      return dat;
    });
    const matches = flags.filter((flag) => flag.match.test(fileData));
    analysis.update((dat) => {
      if (matches.length > 0) dat[file.name] = matches;
      return dat;
    });
    meta.update((dat) => {
      dat.matched++;
      return dat;
    });
  });
  return { analysis, meta };
};

const shortFileMatcher = /(\/|^).{1,2}\.class$/i;
const executableMatcher = /(\/|^)[A-Za-z0-9-]+\.(jar|exe)$/i;
const protectedMatcher = /^.*protected.*$/gim;
export const checkObf = (zip) => {
  const obfFlags = writable([]);
  const files = Object.values(zip.files).filter((f) => !f.dir);
  if (zip.comment)
    obfFlags.update((flags) => [
      ...flags,
      {
        desc: "The jar's zip comment was set, which usually is done by an obfuscator:",
        code: zip.comment,
      },
    ]);
  const susShortFiles = files.filter((f) => shortFileMatcher.test(f.name)).map((f) => f.name);
  if (susShortFiles.length > 0)
    obfFlags.update((flags) => [
      ...flags,
      {
        desc: `${susShortFiles.length} file(s) had a short name, here's some:`,
        code: susShortFiles.slice(0, 3).join("\n"),
      },
    ]);
  const executableFiles = files.filter((f) => executableMatcher.test(f.name)).map((f) => f.name);
  if (executableFiles.length > 0)
    obfFlags.update((flags) => [
      ...flags,
      {
        desc: `${executableFiles.length} file(s) were executable. RatRater won't scan them, but they *might* be malicious. Here's some:`,
        code: executableFiles.slice(0, 3).join("\n"),
      },
    ]);
  const manifest = files.find((f) => /manifest\.mf$/i.test(f.name));
  if (manifest) {
    manifest.async("string").then((data) => {
      const protectedLine = data.match(protectedMatcher);
      console.log(data, protectedLine, protectedMatcher);
      if (protectedLine)
        obfFlags.update((flags) => [
          ...flags,
          {
            desc: "The manifest mentions protection, which usually means an obfuscator was used:",
            code: protectedLine.join("\n"),
          },
        ]);
    });
  }
  const classes = files.filter((f) => /\.class$/i.test(f.name));
  const obfuscators = [
    { name: "Stringer", regex: /\p{Script=Han}{5}[^]+reflect/iu, found: [] },
    { name: "Bozar", regex: /(?=[Il]{9,})(?:(?:I+l+)+I+)/i, found: [] },
    { name: "Branchlock", regex: /branchlock/i, found: [] },
    {
      name: "Skidfuscator",
      regex: /nothing_to_see_here|thisIsAInsaneEncryptionMethod/i,
      found: [],
    },
  ];
  Promise.all(
    classes.map(async (file) => {
      const fileData = await file.async("string");
      obfuscators.forEach((obf) => {
        if (obf.regex.test(file.name) || obf.regex.test(fileData)) obf.found.push(file.name);
      });
    })
  ).then(() => {
    obfuscators.forEach(({ name, found }) => {
      if (found.length > 0)
        obfFlags.update((flags) => [
          ...flags,
          {
            desc: `Signs of the obfuscator ${name} were detected. Here's some of the detected files:`,
            code: found.slice(0, 3).join("\n"),
          },
        ]);
    });
  });
  const progress = writable({ total: 3 + Boolean(manifest) + classes.length, checked: 3 });
  return { obfFlags, progress };
};
