import { inspect } from "node:util";
import { signal } from "@maverick-js/signals";

inspect.defaultOptions.depth = Infinity;
inspect.defaultOptions.colors = true;

const Counter = () => {
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

function renderToHTMLString(component: () => ReturnType<typeof Counter>) {
  const { signals, elements } = component();
}

function elementToHTMLString({ el, props, children }: ReturnType<typeof Counter>["elements"]) {
  const tag = el;
}

function propsToHTMLString
