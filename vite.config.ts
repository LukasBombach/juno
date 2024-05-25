import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import inspect from "vite-plugin-inspect";
import juno from "juno/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), juno(), inspect()],
});
