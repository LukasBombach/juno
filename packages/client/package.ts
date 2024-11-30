import { effect } from "@maverick-js/signals";

type Directive = {
  path: number[];
  attrs?: (() => unknown)[];
  events?: (() => unknown)[];
  children?: ((() => unknown) | number)[];
};

export function hydrate(root: Document | HTMLElement, directives: Directive[]) {
  directives.forEach((directive) => {
    const { path, attrs, events, children } = directive;
    const selector = `& > ${path
      .slice(1)
      .map((n) => `*:nth-child(${n})`)
      .join(" > ")}`;
    const el = root.querySelector(selector);

    if (!el) {
      throw new Error(`Element not found: ${selector}`);
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
        effect(() => ((currentText.textContent = String(child())), undefined));
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
