import fs from "node:fs";
import path from "path";
import { renderToString } from "@juno/ssr";
// import { transform } from "@juno/transform";
import { transformClient } from "@juno/transform_server";

import type { Plugin } from "vite";

export default function juno(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const pagePath = resolvePage(req.url);

        if (!pagePath) {
          return next();
        }

        try {
          const page = await vite.ssrLoadModule(pagePath);
          const html = renderToString(page.default);
          const viteHtml = await vite.transformIndexHtml(req.originalUrl!, html);
          res.end(viteHtml);
        } catch (e) {
          vite.ssrFixStacktrace(e instanceof Error ? e : new Error(String(e)));
          console.error(e);
          next(e);
        }
      });
    },

    async transform(code, id, options) {
      if (id.includes("node_modules")) {
        return null;
      }

      if (!id.endsWith(".tsx")) {
        return null;
      }

      if (options?.ssr) {
        return null;
      }

      return await transformClient(code);
    },
  };
}

function resolvePage(url: string | undefined): string | null {
  const page = !url ? "/index" : url === "/" ? "/index" : url;
  const filePath = path.resolve(`src/${page}.tsx`);
  const exists = fs.existsSync(filePath);
  return exists ? filePath : null;
}
