import type { AstroIntegration, AstroRenderer } from "astro";
import { viteConfig } from "./vite";

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
        updateConfig({ vite: viteConfig });
      },
    },
  };
}
