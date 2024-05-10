import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Inspect from "vite-plugin-inspect";
import { renderToString } from "./src/juno/server";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    Inspect({ build: true, outputDir: ".vite-inspect" }),
    // {
    //   name: "juno test apps",
    //   configureServer(server) {
    //     server.middlewares.use("/pages", async (req, res, next) => {
    //       const urlPath = !req.url || req.url === "/" ? "/index" : req.url;
    //       const fileName = urlPath.replace(/^\/(.*)/, "$1.jsx");
    //       const filePath = path.resolve(__dirname, "pages", fileName);
    //
    //       const { default: Page } = await server.ssrLoadModule(filePath);
    //       const vdom = Page();
    //       const html = renderToString(vdom);
    //       const viteHtml = await server.transformIndexHtml(urlPath, html);
    //
    //       res.end(viteHtml);
    //     });
    //   },
    // },
  ],
});
