import { signal, effect } from "@maverick-js/signals";

import type { HydrationDirectives } from "juno/compiler";
import type { ClientComponent } from "app/client";

export { importClientComponent } from "juno/compiler";

export function getSsrState(): any[] {
  const text = document.body.querySelector("script[type='juno/data']")?.textContent || "{}";
  return JSON.parse(text);
}

export function hydrate(root: HTMLElement, component: ClientComponent, ssrData: any[]) {
  const ctx = { signal, ssrData };
  const entries = component(ctx);

  for (const [path, directives] of entries) {
    const element = getElement(root, path);
    hydrateElement(element, directives);
  }
}

function getElement(root: HTMLElement, path: string): Element {
  const selector = ["&", ...path.split(",").map(n => `> *:nth-child(${n})`)].join(" ");
  return root.querySelector(selector)!;
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
          effect(() => ((currentText.textContent = String(child())), undefined));
        }
      }
    } else {
      effect(() => element.setAttribute(key, value()));
    }
  });
}
