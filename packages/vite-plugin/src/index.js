/**
 * @returns {import('vite').Plugin}
 */
export function juno() {
  return {
    name: "vite-plugin-juno",
    enforce: "pre",
  };
}
