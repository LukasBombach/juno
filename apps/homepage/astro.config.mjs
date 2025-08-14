import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import ViteRestart from "vite-plugin-restart";
import juno from "juno-astro";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      ViteRestart({
        restart: ["../../packages/juno-astro/src/**/*.ts", "../../packages/juno-ast/src/**/*.ts"],
      }),
    ],
  },
  integrations: [juno()],
});
