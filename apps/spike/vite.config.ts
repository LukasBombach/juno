import { defineConfig } from "vite";
import inspect from "vite-plugin-inspect";
import juno from "@juno/vite-plugin-juno";

export default defineConfig({
  plugins: [inspect(), juno()],
  clearScreen: false,
});
