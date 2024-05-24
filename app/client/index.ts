import { importClientComponent, getSsrState, hydrate } from "juno/client";

import type { Component } from "juno/compiler";

const Page: Component = (ctx) => {
  const count = ctx.signal(Math.floor(Math.random() * 100));
  return [
    ["1,2,1", { children: [count] }],
    ["1,2,2", { onClick: () => count.set(count() + 1) }],
  ];
};
Page.id = "index";

const ssrState = getSsrState();
const pageState = ssrState[Page.id];

hydrate(document.body, Page, pageState);
