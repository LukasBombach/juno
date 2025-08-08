import type { AstroIntegration, AstroRenderer } from "astro";
import oxc from "oxc-parser";

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
                async transform(code, id, options) {
                  if (options?.ssr === false && id.endsWith(".tsx") && !id.includes("/node_modules/")) {
                    if (id.includes("Editor.tsx")) {
                      const result = await oxc.parseAsync("Editor.tsx", code, {
                        sourceType: "module",
                        lang: "tsx",
                        astType: "js",
                        range: true,
                      });
                      console.log(result.program);
                      debugger;
                    }
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
