import { signal } from "@maverick-js/signals";
import { getRoots, getState } from "juno/ssr";
import { applyBinding } from "juno/dom";
import "style.css";

import type { InstanceContext } from "juno/ssr";

const roots = getRoots();
const instances = getState();

// todo make this code nicer
const ssr = roots.map(([id, root]) => [root, instances[id].state] as const);

const Counter = (_props: null, ctx: InstanceContext) => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    ["*:nth-child(1)", { onClick: increment }],
    ["*:nth-child(2)", { children: [count] }],
  ] as const;
};

// todos
// [x] support child by selector in ssr (child could be nested in another element)
// [ ] support multiple children
// [ ] support text children at another index in the text content
// [ ] support component by name

for (const [root, state] of ssr) {
  const ctx = { state };
  const bindings = Counter(null, ctx);

  bindings.forEach(([selector, binding]) => {
    const element = root.querySelector(selector)!;
    applyBinding(element, binding);
  });
}
