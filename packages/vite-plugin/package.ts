import fs from "node:fs";
import path from "path";
import { renderToString } from "@juno/ssr";

import type { Plugin } from "vite";

export default function juno(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const page = !req.url ? "/page" : req.url === "/" ? "/page" : req.url;
        const filePath = path.resolve(`src/${page}.tsx`);

        if (fs.existsSync(filePath)) {
          try {
            const page = await vite.ssrLoadModule(filePath);
            const html = renderToString(page.default);
            const viteHtml = await vite.transformIndexHtml(req.originalUrl!, html);
            res.end(viteHtml);
          } catch (e) {
            vite.ssrFixStacktrace(e instanceof Error ? e : new Error(String(e)));
            next(e);
          }
        } else {
          next();
        }
      });
    },

    async resolveId(importee, importer, opts) {
      // console.log("resolveId", { importee, importer, opts });
    },
  };
}
