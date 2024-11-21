import fs from "node:fs";
import path from "path";
import { renderToString } from "@juno/ssr";
import { transform } from "@juno/transform";

import type { Plugin } from "vite";

export default function juno(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const page = !req.url ? "/index" : req.url === "/" ? "/index" : req.url;
        const filePath = path.resolve(`src/${page}.tsx`);

        if (fs.existsSync(filePath)) {
          try {
            const page = await vite.ssrLoadModule(filePath);
            const html = renderToString(page.default);
            const viteHtml = await vite.transformIndexHtml(req.originalUrl!, html);
            res.end(viteHtml);
          } catch (e) {
            vite.ssrFixStacktrace(e instanceof Error ? e : new Error(String(e)));
            console.error(e);
            next(e);
          }
        } else {
          next();
        }
      });
    },

    async transform(code, id, options) {
      if (options?.ssr) {
        return null;
      }

      if (id.includes("node_modules")) {
        return null;
      }

      if (!id.endsWith(".tsx")) {
        return null;
      }

      return await transform(code);
    },
  };
}
