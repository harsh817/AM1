import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ASSET_BUDGETS = [
  { extension: ".js", label: "JS", maxGzipBytes: 100 * 1024 },
  { extension: ".css", label: "CSS", maxGzipBytes: 25 * 1024 },
];

const assetsDir = fileURLToPath(new URL("../dist/assets/", import.meta.url));

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function findLargestAsset(extension) {
  const assets = readdirSync(assetsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => {
      const filePath = join(assetsDir, entry.name);
      const content = readFileSync(filePath);

      return {
        name: entry.name,
        rawBytes: content.byteLength,
        gzipBytes: gzipSync(content).byteLength,
      };
    })
    .sort((current, next) => next.gzipBytes - current.gzipBytes);

  return assets[0];
}

let hasFailure = false;

for (const budget of ASSET_BUDGETS) {
  const asset = findLargestAsset(budget.extension);

  if (!asset) {
    hasFailure = true;
    console.error(`No ${budget.label} asset found. Run npm run build first.`);
    continue;
  }

  const passed = asset.gzipBytes <= budget.maxGzipBytes;
  const status = passed ? "OK" : "OVER";
  console.log(
    `${budget.label} ${status}: ${asset.name} gzip ${formatKb(asset.gzipBytes)} / budget ${formatKb(budget.maxGzipBytes)}; raw ${formatKb(asset.rawBytes)}`,
  );

  if (!passed) hasFailure = true;
}

if (hasFailure) {
  process.exitCode = 1;
}
