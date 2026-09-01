import { readFileSync } from "node:fs";

export function readCssGraph(fileUrl, seen = new Set()) {
  const href = fileUrl.href;
  if (seen.has(href)) return "";
  seen.add(href);

  return readFileSync(fileUrl, "utf8").replace(
    /^@import\s+"([^"]+)";/gm,
    (_, importPath) => readCssGraph(new URL(importPath, fileUrl), seen),
  );
}

export const css = readCssGraph(new URL("./landing.css", import.meta.url));
