import { effect, type WriteSignal } from "@maverick-js/signals";

type Binding = [string, Props];
type Props = Record<string, any> & { children?: (number | WriteSignal<any>)[] };
type InstanceContext = { state: any[] };

export type Component = (props: any, ctx: InstanceContext) => Binding[];

export function hydrate(id: number, component: Component, state: any[]) {
  const root = getRoot(id);
  const ctx = { state };
  const bindings = component(null, ctx);

  bindings.forEach(([selector, props]) => {
    const element = root.querySelector(selector)!;
    attachToDom(element, props);
  });
}

function getRoot(id: number): Element {
  return document.querySelector(`script[juno-id="${id}"]`)!.nextElementSibling!;
}

function attachToDom(element: Element, binding: Props) {
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
