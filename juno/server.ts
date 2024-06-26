import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Request } from "express";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import cliCursor from "cli-cursor";
import chalk from "chalk";

import type { ReactElement, ReactNode } from "react";
import { signal as createSignal, type WriteSignal } from "@maverick-js/signals";

export interface RenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
  ssrData: any[];
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

export function renderToString(node: ReactNode | (() => ReactNode)): string {
  if (typeof node === "boolean") {
    return "";
  }

  if (node === null) {
    return "";
  }

  if (typeof node === "undefined") {
    return "";
  }

  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number") {
    return node.toString();
  }

  if (Array.isArray(node)) {
    throw new Error("not yet implemented");
  }

  if (isReactElement(node)) {
    if (typeof node.type === "string") {
      const attrs = [];
      const children = [];

      const docType = node.type === "html" ? "<!DOCTYPE html>" : "";

      for (let [key, val] of Object.entries(node.props)) {
        if (key.match(/^on[A-Z]/)) {
          // attrs.push(`${key}="--omit--"`);
          continue;
        }

        if (typeof val === "function") {
          val = val();
        }

        if (key === "className") {
          key = "class";
        }

        if (key === "children") {
          const vals = Array.isArray(val) ? val : [val];
          children.push(...vals.map(renderToString));
        } else {
          attrs.push(`${key}="${val}"`);
        }
      }

      if (node.props.children) {
        return `${docType}<${[node.type, ...attrs].join(" ")}>${children.join("")}</${node.type}>`;
      } else if (node.type === "script") {
        return `${docType}<${[node.type, ...attrs].join(" ")}></${node.type}>`;
      }
      {
        return `${docType}<${[node.type, ...attrs].join(" ")} />`;
      }
    }

    if (typeof node.type == "function") {
      return renderToString(node.type(node.props));
    }
  }

  if (typeof node === "function") {
    return renderToString(node());
  }

  console.warn(`Cannot handle react element type ${typeof node}`, node);
  return "";
}

function isReactElement(
  val: any
): val is ReactElement<Record<string, unknown>, string | ((props: Record<string, unknown>) => ReactNode)> {
  return typeof val === "object" && val !== null && "type" in val && "props" in val;
}
