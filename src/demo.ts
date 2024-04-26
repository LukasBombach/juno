import { signal } from "@maverick-js/signals";
import { hydrate } from "juno/client";
import "style.css";

import type { Component } from "juno/client";

const Counter: Component = (_props, ctx) => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    ["*:nth-child(1)", { onClick: increment }],
    ["*:nth-child(2)", { children: [7, count, 6, count] }],
  ];
};

const instances = [
  { id: 1, comp: Counter, state: [23] },
  { id: 2, comp: Counter, state: [5] },
];

for (const { id, comp, state } of instances) {
  hydrate(id, comp, state);
}
