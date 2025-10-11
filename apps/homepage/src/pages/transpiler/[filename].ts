import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { viteConfig as junoViteConfig } from "juno-astro/vite";

import type { APIRoute } from "astro";

const __dirname = fileURLToPath(new URL("../../..", import.meta.url));

async function bundle(filename: string) {
  return await build({
    configFile: false,
    root: path.resolve(__dirname, "."),
    // @ts-expect-error work in progress
    plugins: junoViteConfig.plugins,
    build: {
      minify: false,
      write: false,
      lib: {
        entry: `src/components/${filename}.tsx`,
        fileName: (_format, name) => `${name}.js`,
        formats: ["es"],
      },
      rollupOptions: {
        external: ["@preact/signals-core"],
      },
    },
  });
}

export function getStaticPaths() {
  return [{ params: { filename: "Counter" } }];
}

export const GET: APIRoute = async ({ params }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response("Filename is required", { status: 400 });
  }

  const result = await bundle(filename);

  if (!Array.isArray(result)) {
    return new Response("Vite build did not return an array", { status: 500 });
  }

  const code = result[0].output[0].code;

  return Response.json({ code }, { status: 200 });
};
