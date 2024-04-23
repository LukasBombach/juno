import { signal } from "@maverick-js/signals";
import { getState, getRoots } from "juno/ssr";
import "style.css";

import type { InstanceContext } from "juno/ssr";

const state = getState();
const roots = getRoots();

console.log("hello juno");
console.log("state", state);
console.log("roots", roots);

const Counter = (_props: never, ctx: InstanceContext) => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    { children: [count] }, // label
    { onClick: increment }, // button
  ];
};
