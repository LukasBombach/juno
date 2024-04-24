import { effect } from "@maverick-js/signals";

export type DomBinding = [string, DomBindingProps];
export type DomBindingProps = Record<string, any>;

export function applyBinding(element: Element, binding: DomBindingProps) {
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
