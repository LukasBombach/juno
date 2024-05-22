import { hydrateElement } from "juno/hydrate";
import type { Component } from "juno/compiler";

export { importClientComponent } from "juno/compiler";

export function getSsrState(): Record<string, any[]> {
  const text = document.body.querySelector("script[type='juno/data']")?.textContent || "{}";
  return JSON.parse(text);
}

export function hydrate(component: Component, data: any[], root: HTMLElement) {
  const entries = component();

  for (const [selector, directives] of entries) {
    const element = root.querySelector(selector)!;
    hydrateElement(element, directives);
  }
}
