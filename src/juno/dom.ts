import { effect } from "@maverick-js/signals";

import type { WriteSignal } from "@maverick-js/signals";

export type DomBinding = [string, DomBindingProps];
export type DomBindingProps = Record<string, any> & { children?: number | WriteSignal<unknown> };

export function applyBinding(element: Element, binding: DomBindingProps) {
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
