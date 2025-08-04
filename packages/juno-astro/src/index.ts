import type { AstroIntegration, AstroRenderer, ContainerRenderer } from "astro";

export default function (): AstroIntegration {
  const renderer: AstroRenderer = {
    name: "juno-astro",
    serverEntrypoint: "juno-astro/server.ts",
    clientEntrypoint: "juno-astro/client.ts",
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
          },
        });
      },
    },
  };
}

export function getContainerRenderer(): ContainerRenderer {
  return {
    name: "juno-astro",
    serverEntrypoint: "juno-astro/server.ts",
  };
}
