import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import juno from "juno-astro";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["monaco-editor"],
    },
  },
  integrations: [
    react({
      include: ["**/react/*"],
    }),
    juno(),
  ],
});
