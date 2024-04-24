import { signal } from "@maverick-js/signals";

import type { InstanceContext } from "juno/ssr";
import type { DomBinding } from "juno/dom";

export const Counter = (_props: null, ctx: InstanceContext): DomBinding[] => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    ["*:nth-child(1)", { onClick: increment }],
    ["*:nth-child(2)", { children: [7, count, 6, count] }],
  ];
};
