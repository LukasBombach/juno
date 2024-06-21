import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { transformToClientCode } from "./transform";
import type { Plugin } from "vite";

export default function junoVitePlugin(): Plugin {
  const virtualModuleId = "virtual:juno/client/";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "juno ",
    resolveId(id) {
      console.log("RESOLVE ID", id);
      if (id.startsWith(virtualModuleId)) {
        return "\0" + id;
      }
    },
    async load(id) {
      if (id.startsWith(resolvedVirtualModuleId)) {
        const path = id.slice(resolvedVirtualModuleId.length);
        const absPath = resolve(process.cwd(), path + ".tsx");
        const contents = await readFile(absPath, { encoding: "utf8" });
        return contents;
      }
    },
    shouldTransformCachedModule({ id }) {
      console.log("SHOULD TRANSFORM CACHED MODULE", id);

      return true;

      if (id.startsWith(resolvedVirtualModuleId)) {
        return true;
      }
    },
    async transform(code, id) {
      if (id.startsWith(resolvedVirtualModuleId)) {
        return `export default ${JSON.stringify(transformToClientCode(code))}`;
      }
    },
  };
}
