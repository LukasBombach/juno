import fs from "node:fs";
import path from "path";
import { renderToString } from "@juno/ssr";

import type { Plugin } from "vite";

export function juno(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const page = !req.url ? "/page" : req.url === "/" ? "/page" : req.url;
        const filePath = path.resolve(`src/${page}.tsx`);

        if (fs.existsSync(filePath)) {
          const page = await import(filePath);
          const html = renderToString(page.default);
          const viteHtml = await server.transformIndexHtml(req.originalUrl!, html);
          res.end(viteHtml);
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
