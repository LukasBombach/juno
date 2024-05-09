import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    Inspect({ build: true, outputDir: ".vite-inspect" }),
    //{
    //  name: "juno test apps",
    //  configureServer(server) {
    //    server.middlewares.use("/apps", async (req, res, next) => {
    //      const fileName = req.url!.replace(/^\/(.*)/, "$1.jsx");
    //      console.log((await import(`./apps/${fileName}`)).default);
    //      next();
    //    });
    //  },
    //},
  ],
});
