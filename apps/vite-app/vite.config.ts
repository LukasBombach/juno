import { defineConfig } from "vite";
import juno from "juno-vite/plugin";

export default defineConfig({
  plugins: [juno()],
});
