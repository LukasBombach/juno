import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import juno from "../../packages/astro";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["monaco-editor"],
    },
  },
  integrations: [juno()],
});
