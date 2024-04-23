import { signal } from "@maverick-js/signals";
import { getRoots, getState } from "juno/ssr";
import "style.css";

import type { InstanceContext } from "juno/ssr";

const roots = getRoots();
const state = getState();

console.log("hello juno");
console.log("state", state);
console.log("roots", roots);

const Counter = (_props: null, ctx: InstanceContext) => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    { children: [count] }, // label
    { onClick: increment }, // button
  ];
};

for (const [id, root] of roots) {
  const ctx = { state: state[id].state };
  const handlers = Counter(null, ctx);
  hydrate(root, handlers);
}

function hydrate(root: Element, handlers: any[]) {
  for (const i in handlers) {
    const handler = handlers[i];
    const element = root.children[i];
    handle(element, handler);
  }
}

function handle(element: Element, handler: Record<string, any>) {
  console.log("handle", element, handler);
}
