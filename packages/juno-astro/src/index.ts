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
      "astro:config:setup"({ addRenderer }) {
        addRenderer(renderer);
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
