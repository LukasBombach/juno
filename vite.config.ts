import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Inspect from "vite-plugin-inspect";
import { renderToString } from "./src/juno/server";
import juno from "./src/juno/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), Inspect({ dev: true }), juno()],
});
