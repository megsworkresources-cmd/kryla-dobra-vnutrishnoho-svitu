import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";

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

/** Nitro copies client assets after the client closeBundle hook; verify the final shipped worker. */
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
        const output = join(builder.config.root, ".output/public");
        const source = await readFile(join(output, "sw.js"), "utf8");
        const urls = inspectPrecache(source);
        await Promise.all(urls.map((url) => readFile(join(output, url))));
        console.info(
          `[PWA verified] ${urls.length} precached files exist in the deployable output`,
        );
      },
    },
  };
}
