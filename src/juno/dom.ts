import { effect } from "@maverick-js/signals";

type ElementBinding = Record<string, any>;

export function applyBinding(element: Element, binding: ElementBinding) {
  Object.entries(binding).forEach(([key, value]) => {
    if (key.match(/^on[A-Z]/)) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "children") {
      effect(() => (element.textContent = value[0]()));
    } else {
      effect(() => element.setAttribute(key, value()));
    }
  });
}
