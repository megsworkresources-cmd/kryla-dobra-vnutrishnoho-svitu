import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";

/** Lovable deploys the resolved client directory (currently dist/client), not .output/public. */
export function clientOutputDirectory(config: {
  build: { outDir: string };
  environments?: Record<string, { build?: { outDir?: string } }>;
}) {
  return config.environments?.["client"]?.build?.outDir ?? config.build.outDir;
}

export function inspectPrecache(source: string) {
  const manifest = source.match(/precacheAndRoute\((\[[\s\S]*?\])/);
  const urls = [...(manifest?.[1] ?? "").matchAll(/(?:"url"|url)\s*:\s*["']([^"']+)["']/g)].map(
    (match) => match[1] ?? "",
  );
  for (const required of [/\.js$/, /\.css$/, /(?:^|\/)offline\.html$/, /(?:^|\/)icon-192\.png$/]) {
    if (!urls.some((url) => required.test(url)))
      throw new Error(`Incomplete PWA precache: missing ${required.source}`);
  }
  return urls;
}

export async function verifyPwaOutput(output: string) {
  const source = await readFile(join(output, "sw.js"), "utf8");
  const urls = inspectPrecache(source);
  await Promise.all(urls.map((url) => readFile(join(output, url))));
  return urls.length;
}

/** Generate and verify beside the same resolved client files the host actually deploys. */
export function finalizePwa(): Plugin {
  return {
    name: "verify-final-pwa-output",
    apply: "build",
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        const plugins = builder.config.plugins;
        const plugin = plugins.find((candidate) => candidate.name === "vite-plugin-pwa");
        const api = plugin?.api as { generateSW?: () => Promise<unknown> } | undefined;
        if (!api?.generateSW) throw new Error("PWA generation API is unavailable");
        await api.generateSW();
        const output = resolve(builder.config.root, clientOutputDirectory(builder.config));
        const count = await verifyPwaOutput(output);
        console.info(
          `[PWA verified] ${count} precached files exist in the deployable client output`,
        );
      },
    },
  };
}
