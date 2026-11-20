#!/usr/bin/env node
/**
 * Fails a pull-request CI job when its own check is not a required status check
 * on the base branch.
 *
 * This catches drift between .github/workflows/node.js.yml and branch
 * protection: adding a Node version to the matrix without requiring the new
 * `build (<version>)` check (or removing the rule) fails here with an
 * actionable message instead of leaving every PR unmergeable.
 *
 * Runs only on pull_request events. Uses the workflow's read-only token; no
 * administration permission or personal token is needed.
 */
import fs from "node:fs";

const CHECK_NAME = process.env["CHECK_NAME"];
const TOKEN = process.env["GITHUB_TOKEN"];
const REPO = process.env["GITHUB_REPOSITORY"];
const EVENT_PATH = process.env["GITHUB_EVENT_PATH"];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (process.env["GITHUB_EVENT_NAME"] !== "pull_request") {
  console.log("Not a pull request run; skipping required-check verification.");
  process.exit(0);
}

if (!CHECK_NAME || !TOKEN || !REPO || !EVENT_PATH) {
  fail("CHECK_NAME, GITHUB_TOKEN, GITHUB_REPOSITORY and GITHUB_EVENT_PATH are required");
}

let number;
try {
  const event = JSON.parse(fs.readFileSync(EVENT_PATH, "utf8"));
  number = event.pull_request?.number;
} catch (error) {
  fail(`could not read the pull request event: ${error.message}`);
}
if (!number) fail("the event does not contain a pull request number");

const [owner, name] = REPO.split("/");
if (!owner || !name) fail(`unexpected GITHUB_REPOSITORY: ${REPO}`);

const query = `
  query ($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        baseRefName
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup {
                contexts(first: 100) {
                  nodes {
                    __typename
                    ... on CheckRun {
                      name
                      isRequired(pullRequestNumber: $number)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function loadPullRequest() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
      "user-agent": "required-check-verifier",
    },
    body: JSON.stringify({ query, variables: { owner, name, number } }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${body?.message ?? "unknown error"}`);
  }
  if (body?.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }
  const pullRequest = body?.data?.repository?.pullRequest;
  if (!pullRequest) throw new Error(`pull request ${owner}/${name}#${number} was not found`);
  return pullRequest;
}

let pullRequest;
for (let attempt = 1; attempt <= 6; attempt += 1) {
  try {
    pullRequest = await loadPullRequest();
  } catch (error) {
    fail(`could not verify the required check: ${error.message}`);
  }

  const checks = pullRequest.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes ?? [];
  const check = checks.find(
    (entry) => entry.__typename === "CheckRun" && entry.name === CHECK_NAME,
  );

  if (check) {
    if (!check.isRequired) {
      fail(
        `"${CHECK_NAME}" is not a required status check on "${pullRequest.baseRefName}". ` +
          "Update the branch protection rule to require this exact check (or revert the matrix change) " +
          "so pull requests cannot merge without it.",
      );
    }
    console.log(`✓ "${CHECK_NAME}" is required on "${pullRequest.baseRefName}"`);
    process.exit(0);
  }

  if (attempt < 6) await new Promise((resolve) => setTimeout(resolve, 3000));
}

fail(
  `the "${CHECK_NAME}" check never appeared on the pull request. ` +
    "Make sure the job name still matches the required status check in branch protection.",
);
