import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Request } from "express";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { renderToString } from "juno/renderToString";
import cliCursor from "cli-cursor";
import chalk from "chalk";

import { signal as createSignal, type WriteSignal } from "@maverick-js/signals";

export interface RenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
  ssrData: any[];
}

export function createRenderContext(): RenderContext {
  const signals: WriteSignal<any>[] = [];

  const signal = <T>(value: T) => {
    const s = createSignal<T>(value);
    signals.push(s);
    return s;
  };

  return {
    signal,
    get ssrData() {
      return signals.map(s => s());
    },
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res) => {
    // load the page
    const Page = await importPage(vite, req);

    // render vdom
    const context = createRenderContext();
    const vdom = Page(context);

    // vdom to HTML
    const html = renderToString(vdom);
    const viteHtml = await vite.transformIndexHtml(req.originalUrl, html);

    // respond
    res.send(viteHtml).end();
  });

  app.listen(3000);
}

async function importPage(vite: ViteDevServer, req: Request): Promise<(ctx: RenderContext) => JSX.Element> {
  const urlPath = !req.url || req.url === "/" ? "/index" : req.url;
  const fileName = urlPath.replace(/^\/(.*)/, "$1.tsx");
  const filePath = path.resolve(__dirname, "../app/pages", fileName);
  const mod = await vite.ssrLoadModule(filePath);
  return mod.default;
}

function welcomeMessage() {
  cliCursor.hide();
  console.info("");
  console.info(chalk.blueBright.bold("  hello juno"));
  console.info("");
  console.info(chalk.bold.dim("› local   "), chalk.bold("http://localhost:3000/"));
  console.info(chalk.dim("› inspect "), chalk.dim("http://localhost:3000/__inspect/"));
  console.info("");
}

await createServer();
welcomeMessage();
