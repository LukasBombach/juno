import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { transform } from "oxc-transform";
import { minify } from "terser";
import { format } from "prettier";
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
  const junoResult = transformJsxClient(file, `src/components/${filename}.tsx`);
  const oxcResult = transform(`${filename}.tsx`, junoResult.code, {
    typescript: {
      jsxPragma: "React.createElement",
      jsxPragmaFrag: "React.Fragment",
      onlyRemoveTypeImports: false,
      allowNamespaces: true,
      removeClassFieldsWithoutInitializer: false,
      rewriteImportExtensions: false,
    },
  });

  const minified = await minify(oxcResult.code, {
    mangle: false,
    format: {
      beautify: true, // keep whitespace and indentation
      braces: true,
    },
    compress: {
      defaults: false,
      conditionals: false,
      dead_code: true,
      keep_fargs: false,
      side_effects: true,
      toplevel: true,
      unused: true,
    },
  });

  const formatted = await format(minified.code || "", {
    parser: "typescript",
    printWidth: 120,
    objectWrap: "collapse",
  });

  return Response.json({ code: formatted }, { status: 200 });
};
