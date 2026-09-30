const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const failures = [];

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : [target];
  });
}
function requireFile(base, reference) {
  if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(reference)) return;
  const target = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (target && !fs.existsSync(path.resolve(base, target)))
    failures.push(`Missing reference: ${path.relative(root, base)}/${target}`);
}

for (const directory of ["dist", "scripts", "tests"]) {
  for (const file of files(path.join(root, directory))) {
    if (!/\.(?:js|cjs)$/.test(file)) continue;
    const result = spawnSync(process.execPath, ["--check", file], {
      encoding: "utf8",
    });
    if (result.status !== 0)
      failures.push(result.stderr || result.error?.message || file);
  }
}

for (const file of [
  "package.json",
  "package-lock.json",
  "dist/manifest.webmanifest",
]) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}

const markdown = [
  ...fs
    .readdirSync(root)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(root, file)),
  ...files(path.join(root, "docs")).filter((file) => file.endsWith(".md")),
];
for (const file of markdown) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/\]\(([^\s)]+)\)/g))
    requireFile(path.dirname(file), match[1]);
}
const appRoot = path.join(root, "dist");
const html = fs.readFileSync(path.join(appRoot, "index.html"), "utf8");
for (const match of html.matchAll(/(?:src|href)="(\.[^"]+)"/g))
  requireFile(appRoot, match[1]);
const worker = fs.readFileSync(path.join(appRoot, "sw.js"), "utf8");
const assetList = worker.match(/const ASSETS\s*=\s*\[([\s\S]*?)\];/);
if (!assetList) failures.push("Cannot read the service worker asset list");
else
  for (const match of assetList[1].matchAll(/"([^"]+)"/g))
    requireFile(appRoot, match[1]);
const manifest = JSON.parse(
  fs.readFileSync(path.join(appRoot, "manifest.webmanifest"), "utf8"),
);
for (const icon of manifest.icons) requireFile(appRoot, icon.src);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log("Syntax, JSON, documentation links and application assets: OK");
