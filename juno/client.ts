import { effect } from "@maverick-js/signals";

import type { Component, HydrationDirectives } from "juno/compiler";

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

function hydrateElement(element: Element, binding: HydrationDirectives) {
  Object.entries(binding).forEach(([key, value]) => {
    if (key.match(/^on[A-Z]/)) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "children") {
      let index = 0;
      let text = element.firstChild as Text;
      for (const child of value) {
        if (typeof child === "number") {
          index += child;
        } else {
          const currentText = text.splitText(index);
          text = currentText.splitText(String(child()).length) as Text;
          index = 0;
          effect(() => (currentText.textContent = child()));
        }
      }
    } else {
      effect(() => element.setAttribute(key, value()));
    }
  });
}
