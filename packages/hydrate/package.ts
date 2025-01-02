import { effect } from "@maverick-js/signals";

type Directive = {
  marker: string;
  attrs?: (() => unknown)[];
  events?: (() => unknown)[];
  children?: ((() => unknown) | number)[];
};

export function hydrate(root: Document | HTMLElement, directives: Directive[]) {
  directives.forEach(directive => {
    const { marker, attrs, events, children } = directive;
    const el = document.getElementById(marker)?.previousElementSibling;

    if (!el) {
      throw new Error(`Marker with ID "${marker}" not found`);
    }

    console.debug(
      "hydrating",
      el,
      ...Object.entries({ attrs, events, children })
        .filter(([_, value]) => value !== undefined)
        .flat()
    );

    for (const [name, handler] of Object.entries(events || {})) {
      el.addEventListener(name, handler);
    }

    for (const [name, value] of Object.entries(attrs || {})) {
      effect(() => el.setAttribute(name, String(value())));
    }

    let index = 0;
    let text = el.firstChild;
    asssertChildNode(text);

    for (const child of children || []) {
      if (typeof child === "number") {
        index += child;
      } else {
        assertTextNode(text);
        const currentText = text.splitText(index);
        text = currentText.splitText(String(child()).length);
        index = 0;
        effect(() => {
          currentText.textContent = String(child());
        });
      }
    }
  });
}

function asssertChildNode(node: ChildNode | null): asserts node is ChildNode {
  if (!node) {
    throw new Error(`Expected child node`);
  }
}

function assertTextNode(node: Node): asserts node is Text {
  if (node.nodeType !== Node.TEXT_NODE) {
    throw new Error(`Expected text node`);
  }
}
