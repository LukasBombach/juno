import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import inspect from "vite-plugin-inspect";
import juno from "@juno/vite-plugin-juno";

export default defineConfig({
  plugins: [tailwindcss(), inspect(), juno()],
  clearScreen: false,
});
