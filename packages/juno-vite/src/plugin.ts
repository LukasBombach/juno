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

          console.log(await renderToStaticMarkup(Page()));

          const raw = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <link rel="icon" type="image/svg+xml" href="/vite.svg" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>juno</title>
            </head>
            <body>
              <script type="module" src="/src/main.ts"></script>
            </body>
          </html>
        `;
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
