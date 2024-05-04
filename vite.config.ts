import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    Inspect({
      build: true,
      outputDir: ".vite-inspect",
    }),
  ],
});
