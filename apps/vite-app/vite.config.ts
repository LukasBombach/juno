import { defineConfig } from "vite";
import ViteRestart from "vite-plugin-restart";
import Inspect from "vite-plugin-inspect";
import juno from "juno-vite/plugin";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxFactory: "createElement",
    jsxImportSource: "juno-astro",
  },
  plugins: [
    juno(),
    ViteRestart({
      restart: [
        "../../packages/juno-vite/src/**/*.ts",
        "../../packages/juno-astro/src/**/*.ts",
        "../../packages/juno-ast/src/**/*.ts",
      ],
      reload: [
        "../../packages/juno-vite/src/**/*.ts",
        "../../packages/juno-astro/src/**/*.ts",
        "../../packages/juno-ast/src/**/*.ts",
      ],
    }),
    Inspect(),
  ],
});
