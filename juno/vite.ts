import fs from "node:fs/promises";
import type { Plugin } from "vite";

export default function junoVitePlugin(): Plugin {
  const virtualModuleId = "virtual:juno/client/";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "juno ",
    resolveId(id) {
      if (id.startsWith(virtualModuleId)) {
        return "\0" + id;
      }
    },
    async load(id) {
      if (id.startsWith(resolvedVirtualModuleId)) {
        const path = id.slice(resolvedVirtualModuleId.length);
        return `export const msg = "${path}"`;
      }
    },
  };
}
