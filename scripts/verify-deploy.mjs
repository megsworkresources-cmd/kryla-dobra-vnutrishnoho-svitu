#!/usr/bin/env node
/**
 * Post-deploy check for the production app.
 *
 * Verifies that the live page responds and that every video record under
 * src/assets/video streams with HTTP 206 and its recorded byte size. When the
 * host exposes a deployment commit marker, it also checks that commit.
 *
 * On the production URL it also probes Supabase Auth with an expired token to
 * confirm the Site URL and the signup/reset callbacks still point at this
 * deployment, and that a foreign redirect origin is rejected. The probe creates
 * no account and sends no email.
 *
 *   bun run verify:deploy
 *   node scripts/verify-deploy.mjs --expect <sha>
 *   node scripts/verify-deploy.mjs --base http://127.0.0.1:3000 --skip-commit
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

try {
  process.loadEnvFile?.(".env");
} catch {
  // A missing .env is fine; the auth checks are skipped without a Supabase URL.
}

const DEFAULT_BASE = "https://kryla-dobra-vnutrishnoho-svitu.vercel.app";
const VIDEO_RECORDS = path.resolve("src/assets/video");

const { values } = parseArgs({
  options: {
    base: { type: "string", default: DEFAULT_BASE },
    expect: { type: "string" },
    "skip-commit": { type: "boolean", default: false },
    "skip-auth": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(`Usage: node scripts/verify-deploy.mjs [options]

  --base <url>    Site to check (default: ${DEFAULT_BASE})
  --expect <sha>  Commit the deployment must contain (requires a commit marker)
  --skip-commit   Only check the page and video responses (local previews)
  --skip-auth     Skip the Supabase Auth redirect checks
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

const expectExplicit = Boolean(values.expect);
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
    deployed = (await deployedCommitFromVersionFile()) ?? null;
    deployed ??= html.match(/data-commit-sha="([0-9a-f]{7,40})"/i)?.[1] ?? null;
  }
} catch (error) {
  fail(`page: ${error.message}`);
}

if (!values["skip-commit"]) {
  if (!deployed) {
    if (expectExplicit) {
      fail("deployed commit: --expect was given but this host exposes no commit marker");
    } else {
      console.log("• no commit marker at /version.json; skipping commit check");
    }
  } else if (expected && deployed === expected) {
    pass(`deployed commit ${deployed.slice(0, 7)} matches HEAD`);
  } else if (expected && isAncestor(expected, deployed)) {
    pass(`deployed commit ${deployed.slice(0, 7)} includes ${expected.slice(0, 7)}`);
  } else if (expected) {
    fail(
      `deployed commit ${deployed.slice(0, 7)} is behind ${expected.slice(0, 7)} — deploy the current commit and retry`,
    );
  }
}

function parseRedirect(location) {
  try {
    return new URL(location);
  } catch {
    return null;
  }
}

/**
 * The build writes version.json beside the deployed files, naming the commit it came
 * from. It is fetched with a cache-buster so a cached copy cannot report an old commit.
 */
async function deployedCommitFromVersionFile() {
  try {
    const response = await fetch(`${base}/version.json?deploy-check=${Date.now()}`, {
      headers: { "cache-control": "no-cache" },
      redirect: "follow",
    });
    if (!response.ok) return null;
    const payload = JSON.parse(await response.text());
    return typeof payload?.commit === "string" && /^[0-9a-f]{7,40}$/i.test(payload.commit)
      ? payload.commit
      : null;
  } catch {
    return null;
  }
}

/** Uses an expired token, so this only exercises redirect validation. */
async function probeAuthRedirect(supabaseUrl, redirectTo) {
  const params = new URLSearchParams({
    token: "deploy-check-invalid-token",
    type: "signup",
  });
  if (redirectTo) params.set("redirect_to", redirectTo);
  const response = await fetch(`${supabaseUrl}/auth/v1/verify?${params.toString()}`, {
    redirect: "manual",
  });
  await response.body?.cancel().catch(() => {});
  return { status: response.status, location: response.headers.get("location") ?? "" };
}

if (values["skip-auth"]) {
  console.log("• auth redirects: skipped by --skip-auth");
} else if (base !== DEFAULT_BASE) {
  console.log("• auth redirects: skipped for a custom --base");
} else {
  const supabaseUrl = (
    process.env["VITE_SUPABASE_URL"] ||
    process.env["SUPABASE_URL"] ||
    ""
  ).replace(/\/+$/, "");
  if (!supabaseUrl) {
    console.log("• auth redirects: skipped (VITE_SUPABASE_URL is not set)");
  } else {
    const site = new URL(base).origin;
    try {
      const fallback = await probeAuthRedirect(supabaseUrl);
      const fallbackUrl = parseRedirect(fallback.location);
      const lovablePublished = process.env["LOVABLE_PUBLISHED_URL"]
        ? new URL(process.env["LOVABLE_PUBLISHED_URL"]).origin
        : null;
      const acceptedFallbackOrigins = new Set([site, lovablePublished].filter(Boolean));
      if (
        fallback.status !== 303 ||
        !fallbackUrl ||
        !acceptedFallbackOrigins.has(fallbackUrl.origin) ||
        fallbackUrl.pathname !== "/" ||
        !fallbackUrl.hash.startsWith("#error=")
      ) {
        fail(
          `auth Site URL: expected a fallback to ${[...acceptedFallbackOrigins].join(" or ")}/, got ${fallback.location || `HTTP ${fallback.status}`}`,
        );
      } else {
        pass(`auth Site URL falls back to approved app origin ${fallbackUrl.origin}/`);
      }

      const signup = await probeAuthRedirect(
        supabaseUrl,
        `${site}/caregiver-login?redirect=%2Fparents`,
      );
      const signupUrl = parseRedirect(signup.location);
      if (
        signup.status !== 303 ||
        !signupUrl ||
        signupUrl.origin !== site ||
        signupUrl.pathname !== "/caregiver-login" ||
        signupUrl.searchParams.get("redirect") !== "/parents" ||
        !signupUrl.hash.startsWith("#error=")
      ) {
        fail(
          `auth signup callback: ${site}/caregiver-login was not honored — add it to Supabase Auth → Redirect URLs`,
        );
      } else {
        pass("auth signup callback /caregiver-login is allowed");
      }

      const reset = await probeAuthRedirect(supabaseUrl, `${site}/reset-password`);
      const resetUrl = parseRedirect(reset.location);
      if (
        reset.status !== 303 ||
        !resetUrl ||
        resetUrl.origin !== site ||
        resetUrl.pathname !== "/reset-password" ||
        !resetUrl.hash.startsWith("#error=")
      ) {
        fail(
          `auth reset callback: ${site}/reset-password was not honored — add it to Supabase Auth → Redirect URLs`,
        );
      } else {
        pass("auth reset callback /reset-password is allowed");
      }

      const foreign = await probeAuthRedirect(supabaseUrl, "https://example.com/caregiver-login");
      if (parseRedirect(foreign.location)?.origin === "https://example.com") {
        fail(
          "auth redirects: foreign origin example.com was honored — remove wildcard entries from Supabase Auth → Redirect URLs",
        );
      } else {
        pass("auth redirects: foreign origin is rejected");
      }
    } catch (error) {
      fail(`auth redirects: ${error.message}`);
    }
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
