import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

process.loadEnvFile?.();

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = path.join(projectRoot, "public", "assets");
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) throw new Error("CLOUDINARY_URL is required in the local environment.");

const credentials = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):(.+)@([^/]+)$/);
if (!credentials) throw new Error("CLOUDINARY_URL is not in the expected format.");

const [, apiKey, apiSecret, cloudName] = credentials;
const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
const folder = "AM - Assets";

async function collectWebpFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectWebpFiles(entryPath)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".webp")) files.push(entryPath);
  }

  return files;
}

function publicIdFor(filePath) {
  const relativePath = path.relative(assetsRoot, filePath).replaceAll(path.sep, "/");
  return relativePath.replace(/\.webp$/i, "");
}

async function uploadFile(filePath) {
  const buffer = await readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/webp" }), path.basename(filePath));
  form.append("folder", folder);
  form.append("public_id", publicIdFor(filePath));
  form.append("overwrite", "true");

  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: { Authorization: `Basic ${authorization}` },
    body: form,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${path.relative(projectRoot, filePath)}: ${payload.error?.message || response.statusText}`);
  }

  return {
    localPath: `/assets/${path.relative(assetsRoot, filePath).replaceAll(path.sep, "/")}`,
    secureUrl: payload.secure_url,
  };
}

const files = (await collectWebpFiles(assetsRoot)).sort();
const results = [];

for (const filePath of files) {
  results.push(await uploadFile(filePath));
  console.log(`Uploaded ${path.relative(projectRoot, filePath)}`);
}

console.log(JSON.stringify({ folder, count: results.length, assets: results }, null, 2));
