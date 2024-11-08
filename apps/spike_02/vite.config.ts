import { defineConfig } from "vite";
import { juno } from "@juno/vite-plugin-juno";

export default defineConfig({
  clearScreen: false,
  plugins: [juno()],
});
