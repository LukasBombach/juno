import type { Plugin } from "vite";

export default function junoVitePlugin(): Plugin {
  return {
    name: "juno ",
    transform(code, id, opt) {
      const ssr = Boolean(opt?.ssr);

      if (!ssr) {
        return;
      }

      return code + "\nexport const __juno = true";
    },
  };
}
