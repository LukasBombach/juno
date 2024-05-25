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
    load(id) {
      if (id.startsWith(resolvedVirtualModuleId)) {
        return `export const msg = "from virtual module"`;
      }
    },
  };
}
