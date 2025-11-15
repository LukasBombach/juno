import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToStaticMarkup } from "./renderToStaticMarkup.ts";

import type { Plugin } from "vite";

export default function junoPlugin(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "/";

        if (url === "/") {
          const filePath = new URL(join(server.config.root, "src/index.tsx"), import.meta.url);

          const contents = await readFile(filePath, { encoding: "utf8" });
          console.log({ contents });

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
