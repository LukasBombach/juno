import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { minify } from "terser";
import { transformJsxClient } from "juno-astro/clientTransform";

import type { APIRoute } from "astro";

export function getStaticPaths() {
  return [
    { params: { filename: "Counter" } },
    { params: { filename: "Editor" } },
    { params: { filename: "Playground" } },
  ];
}

const __dirname = fileURLToPath(new URL("../../..", import.meta.url));

export const GET: APIRoute = async ({ params }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response("Filename is required", { status: 400 });
  }

  const file = await fs.readFile(path.resolve(__dirname, `src/components/${filename}.tsx`), "utf-8");
  const transformed = transformJsxClient(file, `src/components/${filename}.tsx`);
  // const { code } = await minify(transformed.code);

  return Response.json({ code: transformed.code }, { status: 200 });
};
