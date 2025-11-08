// plugins/vite-file-router.ts
import { Plugin, IndexHtmlTransformResult, ResolvedConfig } from "vite";
import fg from "fast-glob";
import path from "node:path";
import fs from "node:fs";

type RouteDef = {
  path: string;
  pattern: string; // regex source
  loaderCode: string; // "() => import('...')"
};

export default function fileRouter(opts?: { pagesDir?: string; extensions?: string[] }): Plugin {
  const pagesDir = opts?.pagesDir ?? "src/pages";
  const extensions = opts?.extensions ?? [".tsx", ".jsx", ".ts", ".js"];

  let config: ResolvedConfig;
  let routes: RouteDef[] = [];

  const V_ROUTES = "virtual:file-router";
  const V_CLIENT = "virtual:file-router/client";
  const V_PREFIX = "\0"; // internal id prefix

  return {
    name: "vite-file-router",
    enforce: "pre",

    configResolved(c) {
      config = c;
      routes = buildRoutes({ root: c.root, pagesDir, extensions });
    },

    handleHotUpdate(ctx) {
      // Rebuild routes if a page file changes
      if (ctx.file.startsWith(path.join(config.root, pagesDir))) {
        routes = buildRoutes({ root: config.root, pagesDir, extensions });
        // Invalidate virtual modules so client picks up new manifest
        ctx.server.moduleGraph.invalidateModule(ctx.server.moduleGraph.getModuleById(V_PREFIX + V_ROUTES) || undefined);
        ctx.server.moduleGraph.invalidateModule(ctx.server.moduleGraph.getModuleById(V_PREFIX + V_CLIENT) || undefined);
        ctx.server.ws.send({ type: "full-reload" });
      }
    },

    transformIndexHtml(): IndexHtmlTransformResult {
      return {
        html: undefined,
        tags: [
          {
            tag: "script",
            attrs: { type: "module" },
            children: `import "${V_CLIENT}";`,
            injectTo: "body",
          },
        ],
      };
    },

    resolveId(id) {
      if (id === V_ROUTES) return V_PREFIX + V_ROUTES;
      if (id === V_CLIENT) return V_PREFIX + V_CLIENT;
      return null;
    },

    load(id) {
      if (id === V_PREFIX + V_ROUTES) {
        // Export a ready-to-use manifest with lazy loaders
        const body = `
export const routes = [
${routes.map(r => `  { path: ${JSON.stringify(r.path)}, pattern: ${r.pattern}, load: ${r.loaderCode} }`).join(",\n")}
];`;
        return body;
      }

      if (id === V_PREFIX + V_CLIENT) {
        // Minimal client: intercept links, match route, lazy-import module, call default export
        return `
import { routes } from "${V_ROUTES}";

function match(pathname) {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = re.exec(pathname);
    if (m) return { route: r, params: m.groups || {} };
  }
  return null;
}

async function render(pathname = location.pathname) {
  const m = match(pathname);
  if (!m) { console.warn("No route for", pathname); return }
  const mod = await m.route.load();
  const mount = document.getElementById("app") || document.body;
  if (typeof mod.default === "function") {
    // Your page modules should export default (el => void) or (props) => HTMLElement/void
    const out = mod.default({ params: m.params, mount });
    if (out instanceof HTMLElement) { mount.innerHTML = ""; mount.appendChild(out); }
  } else {
    console.warn("Route module missing default export", m.route.path);
  }
}

function shouldIntercept(a) {
  const url = new URL(a.href, location.href);
  return url.origin === location.origin && !a.hasAttribute('data-external');
}

addEventListener("click", (e) => {
  const a = e.target instanceof Element ? e.target.closest("a") : null;
  if (!a || !shouldIntercept(a)) return;
  e.preventDefault();
  const url = new URL(a.href);
  history.pushState(null, "", url);
  render(url.pathname);
});

addEventListener("popstate", () => render());
render();
`;
      }
      return null;
    },
  };
}

function buildRoutes(opts: { root: string; pagesDir: string; extensions: string[] }): RouteDef[] {
  const absPages = path.join(opts.root, opts.pagesDir);
  if (!fs.existsSync(absPages)) return [];

  const patterns = opts.extensions.map(ext => `${absPages}/**/*${ext}`);
  const files = fg.sync(patterns, { dot: false });

  return files.sort().map(abs => {
    const rel = path.relative(absPages, abs).replace(/\\/g, "/");
    const noExt = rel.replace(/\.[^.]+$/, "");
    const urlPath = toRoutePath(noExt); // e.g. "blog/[slug]" -> "/blog/(?<slug>[^/]+)"
    const importPath = "/" + path.posix.join(opts.pagesDir, rel); // project-root relative
    const loaderCode = `() => import(${JSON.stringify(importPath)})`;
    return { path: "/" + noExt, pattern: routeToRegexSource(urlPath), loaderCode };
  });
}

function toRoutePath(noExt: string): string {
  // Convert FS path to route path with [param] support and index handling
  let p = "/" + noExt;
  p = p.replace(/(^|\/)index$/i, "$1"); // "about/index" -> "about/"
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  // [param] -> (?<param>[^/]+)
  p = p.replace(/\[([^\]/]+)\]/g, (_m, name) => `(?<${name}>[^/]+)`);
  return p || "/";
}

function routeToRegexSource(routePathWithGroups: string): string {
  // Anchor + allow optional trailing slash
  const src = "^" + routePathWithGroups.replace(/\//g, "/").replace(/\./g, "\\.") + "/?$";
  return JSON.stringify(src);
}
