import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import chalk from "chalk";
import cliCursor from "cli-cursor";
import { renderToString } from "juno/server";
import { createRenderContext } from "juno/runtime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares);

  app.use("*", async (req, res) => {
    const urlPath = !req.url || req.url === "/" ? "/index" : req.url;
    const fileName = urlPath.replace(/^\/(.*)/, "$1.tsx");
    const filePath = path.resolve(__dirname, "..", "pages", fileName);

    const context = createRenderContext();
    const { default: Page } = await vite.ssrLoadModule(filePath);
    const vdom = Page(context);

    console.debug(...context.signals.map(s => s()));

    const html = renderToString(vdom);
    const viteHtml = await vite.transformIndexHtml(req.originalUrl, html);

    res.send(viteHtml).end();
  });

  app.listen(3000);
}

cliCursor.hide();

await createServer();

console.info("");
console.info(chalk.hex("#FF8800").bold("  hello juno"));
console.info("");
console.info(chalk.bold.dim("› local   "), chalk.bold("http://localhost:3000/"));
console.info(chalk.dim("› inspect "), chalk.dim("http://localhost:3000/__inspect/"));
console.info("");
