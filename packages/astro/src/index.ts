import type { AstroIntegration, AstroRenderer } from "astro";

export default function (): AstroIntegration {
  const renderer: AstroRenderer = {
    /** renderer name shown in <component client:only="name" /> */
    name: "juno",
    serverEntrypoint: "juno-astro/server",
    clientEntrypoint: "juno-astro/client",
  };

  return {
    name: "juno",
    hooks: {
      "astro:config:setup"({ addRenderer }) {
        addRenderer(renderer);
      },
    },
  };
}
