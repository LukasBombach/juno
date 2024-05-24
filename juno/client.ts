import { hydrateElement } from "juno/hydrate";
import type { Component } from "juno/compiler";

export { importClientComponent } from "juno/compiler";

export function getSsrState(): Record<string, any[]> {
  const text = document.body.querySelector("script[type='juno/data']")?.textContent || "{}";
  return JSON.parse(text);
}

export function hydrate(root: HTMLElement, component: Component, data: any[]) {
  const entries = component();

  for (const [selector, directives] of entries) {
    const element = root.querySelector(selector)!;
    hydrateElement(element, directives);
  }
}
