import { signal } from "@maverick-js/signals";
import { getRoots, getState } from "juno/ssr";
import { apply } from "juno/client";
import "style.css";

import type { InstanceContext } from "juno/ssr";

const roots = getRoots();
const state = getState();

const Counter = (_props: null, ctx: InstanceContext) => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    { onClick: increment }, // button
    { children: [count] }, // label
  ];
};

for (const [id, root] of roots) {
  const ctx = { state: state[id].state };
  const bindings = Counter(null, ctx);

  for (const i in bindings) {
    apply(root.children[i], bindings[i]);
  }
}
