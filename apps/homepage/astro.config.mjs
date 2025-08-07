import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import ViteRestart from "vite-plugin-restart";
import juno from "juno-astro";

console.log(
  import.meta.dirname + "/node_modules/juno-astro/src/client.ts",
  import.meta.dirname + "/../../packages/juno-astro/src/client.ts"
);

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      ViteRestart({
        restart: [
          import.meta.dirname + "/node_modules/juno-astro/src/client.ts",
          import.meta.dirname + "/../../packages/juno-astro/src/client.ts",
        ],
      }),
    ],
    optimizeDeps: {
      exclude: ["juno-astro"],
    },
    server: {
      watch: {
        ignored: [/node_modules\/(?!juno-astro).*/],
      },
    },
  },
  integrations: [juno()],
});
