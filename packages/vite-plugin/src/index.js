/**
 * @returns {import('vite').Plugin}
 */
export function juno() {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log(req.url);
        res.end("hello world");
      });
    },

    async resolveId(importee, importer, opts) {
      // console.log("resolveId", { importee, importer, opts });
    },
  };
}
