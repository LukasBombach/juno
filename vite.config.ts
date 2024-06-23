import { defineConfig } from "vite";
import fullReload from "vite-plugin-full-reload";
import tsconfigPaths from "vite-tsconfig-paths";
import inspect from "vite-plugin-inspect";
import juno from "juno/vite-plugin-juno";

export default defineConfig({
  clearScreen: false,
  plugins: [fullReload(["juno/**/*"]), tsconfigPaths(), juno(), inspect()],
});
