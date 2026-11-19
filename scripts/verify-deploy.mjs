#!/usr/bin/env node
/**
 * Post-publish check for the published Lovable app.
 *
 * Verifies that the live page was built from the expected commit and that every
 * video record under src/assets/video streams with HTTP 206 and its recorded
 * byte size. Run after publishing:
 *
 *   bun run verify:deploy
 *   node scripts/verify-deploy.mjs --expect <sha>
 *   node scripts/verify-deploy.mjs --base http://127.0.0.1:3000 --skip-commit
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_BASE = "https://kryla-dobra-vnutrishnoho-svitu.lovable.app";
const VIDEO_RECORDS = path.resolve("src/assets/video");

const { values } = parseArgs({
  options: {
    base: { type: "string", default: DEFAULT_BASE },
    expect: { type: "string" },
    "skip-commit": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(`Usage: node scripts/verify-deploy.mjs [options]

  --base <url>    Site to check (default: ${DEFAULT_BASE})
  --expect <sha>  Commit the deployment must contain (default: local HEAD)
  --skip-commit   Only check the page and video responses (local previews)
  -h, --help      Show this help`);
  process.exit(0);
}

const base = values.base.replace(/\/+$/, "");
const failures = [];
const pass = (message) => console.log(`✓ ${message}`);
const fail = (message) => {
  failures.push(message);
  console.log(`✗ ${message}`);
};

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

let expected = values.expect;
if (!values["skip-commit"] && !expected) {
  try {
    expected = git(["rev-parse", "HEAD"]);
  } catch {
    fail("could not read local HEAD; pass --expect <sha> or --skip-commit");
  }
}

const assets = readdirSync(VIDEO_RECORDS)
  .filter((name) => name.endsWith(".mp4.asset.json"))
  .map((name) => {
    const record = JSON.parse(readFileSync(path.join(VIDEO_RECORDS, name), "utf8"));
    return { name: name.replace(".asset.json", ""), url: record.url, size: record.size };
  });

if (!assets.length) fail("no video asset records found in src/assets/video");

console.log(`Checking ${base}`);
console.log(`Expected commit: ${expected ?? "(not checked)"}\n`);

let deployed = null;
try {
  const response = await fetch(`${base}/?deploy-check=${Date.now()}`, {
    headers: { "cache-control": "no-cache" },
    redirect: "follow",
  });
  if (!response.ok) {
    fail(`page: expected 200, got ${response.status}`);
  } else {
    pass("page responds 200");
    const html = await response.text();
    deployed = html.match(/data-commit-sha="([0-9a-f]{7,40})"/i)?.[1] ?? null;
  }
} catch (error) {
  fail(`page: ${error.message}`);
}

if (!values["skip-commit"]) {
  if (!deployed) {
    fail("deployed commit: data-commit-sha not found (is this the Lovable production URL?)");
  } else if (expected && deployed === expected) {
    pass(`deployed commit ${deployed.slice(0, 7)} matches HEAD`);
  } else if (expected && isAncestor(expected, deployed)) {
    pass(`deployed commit ${deployed.slice(0, 7)} includes ${expected.slice(0, 7)}`);
  } else if (expected) {
    fail(
      `deployed commit ${deployed.slice(0, 7)} is behind ${expected.slice(0, 7)} — publish in Lovable and retry`,
    );
  }
}

let streamed = 0;
for (const asset of assets) {
  if (!asset.url?.startsWith("/media/video/")) {
    fail(`${asset.name}: record does not point at /media/video`);
    continue;
  }
  try {
    const response = await fetch(base + asset.url, {
      headers: { range: "bytes=0-1", "cache-control": "no-cache" },
      redirect: "follow",
    });
    const type = response.headers.get("content-type") ?? "";
    const range = response.headers.get("content-range") ?? "";
    const total = Number(range.split("/").pop());
    let body = null;
    if (response.status === 206) body = await response.arrayBuffer();
    else await response.body?.cancel().catch(() => {});

    if (response.status !== 206) {
      fail(`${asset.name}: expected 206, got ${response.status}`);
    } else if (!type.startsWith("video/mp4")) {
      fail(`${asset.name}: content-type ${type || "(missing)"}`);
    } else if (total !== asset.size) {
      fail(`${asset.name}: content-range total ${range || "(missing)"}, expected ${asset.size}`);
    } else if (body.byteLength !== 2) {
      fail(`${asset.name}: range body was ${body.byteLength} bytes, expected 2`);
    } else {
      pass(`${asset.name}: 206, ${total} bytes`);
      streamed++;
    }
  } catch (error) {
    fail(`${asset.name}: ${error.message}`);
  }
}

console.log(`\n${streamed}/${assets.length} video assets stream correctly.`);
if (failures.length) {
  console.error(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("Deployment looks healthy.");
