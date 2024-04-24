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
    { onClick: increment }, // button
    { children: [count] }, // label
  ];
};

// todos
// - support child by selector in ssr (child could be nested in another element)
// - support component by name
// - support multiple children
// - support text children at another index in the text content

for (const [root, state] of ssr) {
  const ctx = { state };
  const bindings = Counter(null, ctx);

  for (const i in bindings) {
    applyBinding(root.children[i], bindings[i]);
  }
}
