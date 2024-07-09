import { transformWithEsbuild } from "vite";
// import { transformToClientCode } from "juno/transform";
// import { transformToClientCode } from "juno/transform2";
import { transformToClientCode } from "juno/transform-fp2";
import type { Plugin } from "vite";

export default function junoVitePlugin(): Plugin {
  return {
    name: "juno",
    enforce: "pre",
    async transform(code, id) {
      if (id.endsWith("?juno")) {
        return await transformToClientCode(code);
      }
    },
  };
}
