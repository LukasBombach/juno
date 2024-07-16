import { transformToClientCode } from "juno/transform-fp";
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
