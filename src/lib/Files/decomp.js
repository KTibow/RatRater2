const hashCode = (str) => {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
export const decompile = async (data, dataBuffer, name) => {
  const form = new FormData();
  form.set("to_be_decompiled", new Blob([dataBuffer]), name.replace(/[^a-zA-Z0-9_.-]/g, "_"));
  let decompiled = localStorage[hashCode(data)];
  if (!decompiled) {
    const response = await fetch("https://Decompiler.ktibow.repl.co", {
      method: "POST",
      body: form,
    });
    decompiled = await response.text();
    localStorage[hashCode(data)] = decompiled;
  }
  return decompiled;
};
