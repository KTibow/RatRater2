const prescan = (zip, files, obfuscation, flags, flag) => {
  if (zip.comment) {
    obfuscation["Custom zip comment"] = { quote: zip.comment };
  }
  const shorts = files
    .map((file) => ({ file, match: file.match(/(\/|^)(.{1,2})\.class$/i) }))
    .filter((m) => m.match);
  if (shorts.length > 3) {
    const shortest = shorts.sort((a, b) => a.match[1].length - b.match[1].length)[0];
    obfuscation["Possible obfuscation (short file names)"] = { file: shortest.file };
  }
  const executables = files.filter((file) => /\.(jar|exe|dll)$/i.test(file));
  if (executables.length > 0) {
    obfuscation["Non-scanned executable files"] = {
      file: executables[0],
    };
  }
  const bozar = files.find((file) => /(?=[Il]{9,})(?:(?:I+l+)+I+)/.test(file));
  if (bozar) obfuscation["Obfuscator Bozar"] = { file: bozar };
  const branchlock = files.find((file) => file.toLowerCase().includes("branchlock"));
  if (branchlock) obfuscation["Obfuscator Branchlock"] = { file: branchlock };

  const kodeine = files.find((file) => file.startsWith("a/b/c/d"));
  if (kodeine) flag({ name: "Kodeine", file: kodeine });
  const yoink = files.find((file) => file.startsWith("net/jodah/typetools"));
  if (yoink) flag({ name: "Yoink", file: yoink });
  const cpNormal = files.find((file) => file.startsWith("me/custompayload/normal"));
  if (cpNormal) flag({ name: "CustomPayload Normal", file: cpNormal });
  const sbft = files.find((file) => file.startsWith("com/sbft"));
  if (sbft) flag({ name: "SBFT", file: sbft });
  const macromod = files.find((file) => file.startsWith("com/macromod"));
  if (macromod) flag({ name: "MacroMod", file: macromod });
  const quanity = files.find((file) => file.startsWith("com/quantiy"));
  if (quanity) flag({ name: "Quanity", file: quanity });
};
const processors = [
  {
    check: (contents) => /(?=[Il]{9,})(?:(?:I+l+)+I+)/.test(contents),
    add: (file, obfuscation, flags, flag) =>
      (obfuscation["Obfuscator Bozar"] = {
        file,
        initialFind: { searchString: "(?=[Il]{9,})(?:(?:I+l+)+I+)", isRegex: true },
      }),
  },
  {
    check: (contents) => contents.toLowerCase().includes("branchlock"),
    add: (file, obfuscation, flags, flag) =>
      (obfuscation["Obfuscator Branchlock"] = {
        file,
        initialFind: { searchString: "branchlock", isRegex: true },
      }),
  },
  {
    check: (contents) =>
      contents.includes("nothing_to_see_here") ||
      contents.includes("thisIsAInsaneEncryptionMethod"),
    add: (file, obfuscation, flags, flag) =>
      (obfuscation["Obfuscator Skidfuscator"] = {
        file,
        initialFind: {
          searchString: "nothing_to_see_here|thisIsAInsaneEncryptionMethod",
          isRegex: true,
        },
      }),
  },
  {
    check: (contents) => /\p{Script=Han}{5}/u.test(contents) && contents.includes("reflect"),
    add: (file, obfuscation, flags, flag) => (obfuscation["Obfuscator Stringer"] = { file }),
  },
  {
    check: (contents) => contents.includes("func_111286_b") || contents.includes("func_148254_d"),
    add: (file, obfuscation, flags, flag) => {
      if (flags["Uses session token"]) return flags["Uses session token"].matches.push(file);
      flags["Uses session token"] = {
        matches: [file],
        link: "https://github.com/KTibow/RatRater2/wiki/Flags#func_111286_b--func_148254_d",
        initialFind: { searchString: "func_111286_b|func_148254_d", isRegex: true },
      };
    },
  },
  {
    check: (contents) =>
      /https?:\/\/checkip\.amazonaws\.com/i.test(contents) ||
      contents.includes("api.myip.com") ||
      contents.includes("whatismyip"),
    add: (file, obfuscation, flags, flag) => {
      if (flags["Gets your IP address"]) return flags["Gets your IP address"].matches.push(file);
      flags["Gets your IP address"] = {
        matches: [file],
        link: "https://github.com/KTibow/RatRater2/wiki/Flags#ip-addresses",
        initialFind: {
          searchString: String.raw`https?:\/\/checkip\.amazonaws\.com|api.myip.com|whatismyip`,
          isRegex: true,
        },
      };
    },
  },
  {
    check: (contents) =>
      contents.includes(String.raw`\Google\Chrome\User Data\Default`) ||
      contents.includes("essential/microsoft_accounts.json") ||
      contents.includes(".lunarclient/settings/game/accounts.json") ||
      contents.includes(".feather/accounts.json"),
    add: (file, obfuscation, flags, flag) => {
      if (flags["File access"]) return flags["File access"].matches.push(file);
      flags["File access"] = {
        matches: [file],
        link: "https://github.com/KTibow/RatRater2/wiki/Flags#file-access",
        initialFind: {
          searchString: String.raw`\Google\Chrome\User Data\Default|essential/microsoft_accounts.json|.lunarclient/settings/game/accounts.json`,
          isRegex: true,
        },
      };
    },
  },
  {
    check: (contents) => contents.includes("Skidfuscator Anti-Abuse"),
    add: (file, obfuscation, flags, flag) => {
      if (flags["Skidfuscator warning"]) return flags["Skidfuscator warning"].matches.push(file);
      flags["Skidfuscator warning"] = {
        matches: [file],
        link: "https://github.com/KTibow/RatRater2/wiki/Flags#skidfuscator-warning",
        initialFind: { searchString: "Skidfuscator Anti-Abuse" },
      };
    },
  },
];
export default async ({ zip, hash, files }, analysis, progress) => {
  let flagged;
  const obfuscation = {},
    flags = {},
    flag = (f) => (flagged = f),
    propagate = () => analysis.set({ obfuscation, flags, flagged });
  let done = 0;

  try {
    prescan(zip, files, obfuscation, flags, flag);
  } catch (e) {
    console.error("While prescanning", e);
  }
  propagate();

  const tasks = files
    .filter((path) => path.endsWith(".class"))
    .map(async (f) => {
      const contents = await zip.files[f].async("string");
      processors.forEach((p) => {
        if (p.check(contents)) p.add(f, obfuscation, flags, flag);
      });
      propagate();
    });

  const manifest = files.find((f) => /manifest\.mf$/i.test(f));
  const manifestTask = async () => {
    const contents = await zip.files[manifest].async("string");
    const protectedLine = contents.match(/^(?=.*protected).*$/im);
    if (!protectedLine) return;
    obfuscation["Obfuscator noted in manifest.mf"] = {
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
  if (manifest) tasks.push(manifestTask());

  const catchTask = (e) => {
    console.error("While scanning,", e);
  };
  const afterTask = () => {
    done++;
    progress.set({ done, total: tasks.length });
  };
  await Promise.all(tasks.map((task) => task.catch(catchTask).finally(afterTask)));
};
