// Swap for your browser bundle’s hydrate/patch function
import { hydrateRoot /*, h*/ } from "my-client-runtime";

/**
 * Astro injects this wrapper on the page and calls it once per island.
 */
export default (el: HTMLElement) =>
  (Comp: any, props: any, { default: children }: any) => {
    hydrateRoot(el /* h(Comp, props, children) */);
  };
