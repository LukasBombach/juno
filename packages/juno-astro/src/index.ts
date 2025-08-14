import type { AstroIntegration, AstroRenderer } from "astro";
import { transformJsx } from "./clientTransform";

export default function (): AstroIntegration {
  const renderer: AstroRenderer = {
    name: "juno-astro",
    serverEntrypoint: `${import.meta.dirname}/server.ts`,
    clientEntrypoint: `${import.meta.dirname}/client.ts`,
  };

  return {
    name: "juno-astro",
    hooks: {
      "astro:config:setup"({ addRenderer, updateConfig }) {
        addRenderer(renderer);
        updateConfig({
          vite: {
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
                  if (options?.ssr === false && id.endsWith(".tsx") && !id.includes("/node_modules/")) {
                    if (id.includes("Demo")) return transformJsx(code, id);
                  }
                  return code;
                },
              },
            ],
          },
        });
      },
    },
  };
}
