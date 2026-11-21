// Standalone generated-Workbox fixture, NOT a production build or an app preview.
import { createRequire } from "node:module";
import { mkdtemp, mkdir, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pwaWorkboxOptions } from "./pwa-workbox";
import { verifyPwaOutput } from "./pwa-build";

const require = createRequire(import.meta.url);
// Workbox is the generator already supplied by vite-plugin-pwa.
const { generateSW } = require("workbox-build");
const root = await mkdtemp(join(tmpdir(), "offline-acceptance-"));
await mkdir(join(root, "assets"));
await writeFile(join(root, "assets/app.js"), "console.log('offline acceptance fixture');");
await writeFile(join(root, "assets/app.css"), "body { font-family: serif; }");
await copyFile("public/offline.html", join(root, "offline.html"));
await copyFile("public/icon-192.png", join(root, "icon-192.png"));
await copyFile("public/manifest.webmanifest", join(root, "manifest.webmanifest"));
const result = await generateSW({
  ...pwaWorkboxOptions(),
  globDirectory: root,
  swDest: join(root, "sw.js"),
});
const count = await verifyPwaOutput(root);
if (result.count !== count) throw new Error("Generated and inspected precache counts differ");
await writeFile(
  join(root, "acceptance.json"),
  JSON.stringify({ root, count, warnings: result.warnings }),
);
console.log(JSON.stringify({ root, count, warnings: result.warnings }));
