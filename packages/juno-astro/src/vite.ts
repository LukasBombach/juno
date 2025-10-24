import { transformJsxClient } from "./clientTransform";
import { transformJsxServer } from "./serverTransform";

import type { ViteUserConfig } from "astro";

export const viteConfig: ViteUserConfig = {
  esbuild: {
    jsx: "automatic",
    jsxFactory: "createElement",
    jsxImportSource: "juno-astro",
  },
  plugins: [
    {
      name: "juno-astro-transform",
      enforce: "pre",
      transform(code, id, options) {
        if (!id.endsWith(".tsx") || id.includes("/node_modules/")) {
          return code;
        }

        if (options?.ssr === true) {
          return transformJsxServer(code, id);
        }

        if (options?.ssr === false) {
          return transformJsxClient(code, id);
        }

        return code;
      },
    },
  ],
};
