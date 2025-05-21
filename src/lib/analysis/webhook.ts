import type JSZip from "jszip";
import type { JSZipObject } from "jszip";
import { get } from "svelte/store";
import { file, type Loaded } from "$lib/state";

const whRegex =
  /(https?:\/\/(ptb\.|canary\.)?discord(app)?\.com\/api\/webhooks\/(\d{10,20})\/([\w\-]{68}))/g;
const b64Regex = /(?:[A-Za-z0-9+/]{4})*[A-Za-z0-9+/][A-Za-z0-9+/][A-Za-z0-9+/=][A-Za-z0-9+/=]/g;
export const scanWebhooks = async () => {
  const fileData = get(file) as Loaded;
  const zip = fileData.zip as JSZip & JSZipObject;
  const files = Object.values(zip.files)
    .filter((f) => !f.dir)
    .map((f) => f.name);

  const process = async (file: string) => {
    const contents = await zip.files[file].async("string");
    const contentsNormalized = contents
      .replace(/UY[\x00-\x20][^][\x00-\x20]/g, "")
      .replace(/UY[\x00-\x20][^]/g, "");
    if (file.endsWith("McMod.class")) console.log(contentsNormalized);
    const webhooks = contentsNormalized.matchAll(whRegex);
    const base64 = contents.matchAll(b64Regex);

    const list: string[] = [];
    for (const webhook of webhooks) {
      list.push(webhook[0]);
    }
    for (const [base] of base64) {
      if (base.length < 40 || base.length > 200) continue;
      try {
        const decoded = atob(base);
        const webhook = decoded.match(whRegex);
        if (webhook) {
          list.push(webhook[0]);
        } else if (b64Regex.test(decoded)) {
          try {
            const decoded2 = atob(decoded);
            const webhook = decoded2.match(whRegex);
            if (webhook) {
              list.push(webhook[0]);
            }
          } catch {}
        }
      } catch {}
    }
    return list;
  };

  const list: Set<string> = new Set();
  await Promise.all(
    files.map(async (f) => {
      const result = await process(f);
      result.forEach((w) => list.add(w));
    }),
  );
  return list;
};
