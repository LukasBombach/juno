import { inspect } from "node:util";
import { signal, type WriteSignal } from "@maverick-js/signals";

inspect.defaultOptions.depth = Infinity;
inspect.defaultOptions.colors = true;

type Component = () => {
  signals: WriteSignal<any>[];
  elements: Element;
};

interface Element {
  el: string;
  props: Record<string, any>;
  children: Child[];
}

type Child = Element | string | number;

const Counter: Component = () => {
  const count = signal(Math.round(Math.random() * 100));
  return {
    signals: [count],
    elements: {
      el: "section",
      props: {},
      children: [
        { el: "label", props: {}, children: [count()] },
        { el: "hr", props: {}, children: [] },
        { el: "button", props: { onClick: () => count.set(count() + 1) }, children: ["Click"] },
      ],
    },
  };
};

function renderToHTMLString({ signals, elements }: ReturnType<typeof Counter>) {
  return {
    values: signals.map((signal) => signal()),
    html: elementToHTMLString(elements),
  };
}

function elementToHTMLString({ el, props, children }: Element) {
  const tag = el;
  const attrs = propsToAttrs(props);
  const selfClosing = isSelfClosing(tag) || children.length === 0;
  const childrenHTML = childrenToHTML(children).join("");
  const opening = [tag, ...attrs].join(" ");
  return selfClosing ? `<${opening} />` : `<${opening}>${childrenHTML}</${tag}>`;
}

function childrenToHTML(children: Child[]): string[] {
  return children.map((child) => {
    if (typeof child === "string") return child;
    if (typeof child === "number") return String(child);
    return elementToHTMLString(child);
  });
}

function propsToAttrs(props: Record<string, unknown>): string[] {
  return Object.entries(props)
    .filter(([key]) => !key.match(/^on[A-Z]/))
    .map(([key, value]) => `${key}="${value}"`);
}

function isSelfClosing(tag: string) {
  return tag.match(/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/);
}

console.log(renderToHTMLString(Counter()));
