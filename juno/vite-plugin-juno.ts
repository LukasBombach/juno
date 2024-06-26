import { transformWithEsbuild } from "vite";
import { transformToClientCode } from "./transform";
import type { Plugin } from "vite";

export default function junoVitePlugin(): Plugin {
  return {
    name: "juno",
    enforce: "pre",
    async transform(code, id) {
      if (id.endsWith("?juno")) {
        const transformed = await transformToClientCode(code);
        const filename = id.replace("?juno", "");
        return await transformWithEsbuild(transformed, filename, { sourcefile: filename, loader: "tsx" });
      }
    },
  };
}
