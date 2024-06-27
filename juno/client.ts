import { signal, effect } from "@maverick-js/signals";

import type { WriteSignal } from "@maverick-js/signals";

export type HydrationDirectives = {
  path: number[];
  children?: (number | WriteSignal<any> | ClientComponent)[];
} & Record<Exclude<string, "children">, any>;

export interface ClientRenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
  ssrData: any[];
}

export interface ClientComponent {
  (ctx: ClientRenderContext): HydrationDirectives[];
}

export function getSsrState(): any[] {
  const text = document.body.querySelector("script[type='juno/data']")?.textContent || "{}";
  return JSON.parse(text);
}

export function hydrate(root: HTMLElement | Document, component: ClientComponent, ssrData: any[]) {
  const ctx = { signal, ssrData };
  const entries = component(ctx);

  for (const directives of entries) {
    const element = getElement(root, directives.path);
    hydrateElement(element, directives);
  }
}

function getElement(root: HTMLElement | Document, path: number[]): Element {
  const selector = ["&", ...path.map((n) => `> *:nth-child(${n})`)].join(" ");
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
    } else if (key === "path") {
      // do nothing
    } else {
      effect(() => element.setAttribute(key, value()));
    }
  });
}
