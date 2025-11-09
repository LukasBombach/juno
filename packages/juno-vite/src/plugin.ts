import type { Plugin, IndexHtmlTransformResult } from "vite";

export default function junoPlugin(): Plugin {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    transformIndexHtml(): IndexHtmlTransformResult {
      return {
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>JUNRRRR</title>
          </head>
          <body>
          junoooo  
          </body>
          </html>
        `,
        tags: [],
      };
    },
  };
}
