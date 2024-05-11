import { defineConfig } from "vite";
import TsconfigPaths from "vite-tsconfig-paths";
import Inspect from "vite-plugin-inspect";
import Juno from "./src/juno/vite";

export default defineConfig({
  plugins: [TsconfigPaths(), Inspect(), Juno()],
});
