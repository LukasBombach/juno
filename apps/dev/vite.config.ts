import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import restart from "vite-plugin-restart";
import inspect from "vite-plugin-inspect";
import juno from "@juno/vite-plugin-juno";

export default defineConfig({
  plugins: [
    tailwindcss(),
    inspect(),
    restart({
      restart: [
        "../../packages/parse/**/*",
        "../../packages/pipe/**/*",
        "../../packages/ssr/**/*",
        "../../packages/transform/**/*",
        "../../packages/traverse/**/*",
        "../../packages/vite-plugin/**/*",
      ],
    }),
    juno(),
  ],
  clearScreen: false,
});
