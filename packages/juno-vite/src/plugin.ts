import type { Plugin, IndexHtmlTransformResult, ResolvedConfig } from "vite";

interface RouteDef {
  path: string;
  pattern: string; // regex source
  loaderCode: string; // "() => import('...')"
}

export default function junoPlugin(
  opts: {
    pagesDir?: string;
    extensions?: string[];
  } = {}
): Plugin {
  const pagesDir = opts?.pagesDir ?? "src/pages";
  const extensions = opts?.extensions ?? [".tsx", ".jsx", ".ts", ".js"];

  let config: ResolvedConfig;
  let routes: RouteDef[] = [];

  const V_ROUTES = "virtual:file-router";
  const V_CLIENT = "virtual:file-router/client";
  const V_PREFIX = "\0"; // internal id prefix

  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    configResolved(c) {
      config = c;
      routes = buildRoutes({ root: c.root, pagesDir, extensions });
    },

    resolveId(source, importer, options) {
      console.log("resolveId", { source });
      return null;
    },
  };
}
