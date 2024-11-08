/**
 * @returns {import('vite').Plugin}
 */
export function juno() {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",

    async resolveId(importee, importer, opts) {
      console.log("resolveId", { importee, importer, opts });
    },
  };
}
