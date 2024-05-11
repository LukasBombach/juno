import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Inspect from "vite-plugin-inspect";
import Juno from "./src/juno/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), Inspect(), Juno()],
});
