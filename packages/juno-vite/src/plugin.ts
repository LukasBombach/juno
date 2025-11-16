import { renderToStaticMarkup } from "./renderToStaticMarkup.ts";

import type { Plugin } from "vite";

export default function junoPlugin(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    config(config) {
      return {
        ...config,
        esbuild: {
          ...(config.esbuild ?? {}),
          jsxImportSource: "juno-vite",
        },
      };
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "/";

        if (url === "/") {
          const { default: Page } = await server.ssrLoadModule("src/index.tsx");
          const raw = await renderToStaticMarkup(Page());

          console.log(raw);

          const transformed = await server.transformIndexHtml(url, raw);

          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(transformed);
          return;
        }
        next();
      });
    },
  };
}
