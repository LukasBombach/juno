import fs from "node:fs";
import path from "path";

/**
 * @returns {import('vite').Plugin}
 */
export function juno() {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const reqPath = req.url === "/" ? "/page.html" : req.url + ".html";
        const filePath = path.resolve(path.join("src", reqPath));

        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          res.end(fileContent);
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
