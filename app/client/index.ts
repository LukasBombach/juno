import { getSsrState, hydrate } from "juno/client";
import PageX from "app/pages/index?juno";
import type { ClientComponent } from "juno/client";

console.log(PageX.toString());

const Page: ClientComponent = (ctx) => {
  const count = ctx.signal(ctx.ssrData[0]);
  return [
    [[2, 1], { children: [count] }],
    [[2, 2], { onClick: () => count.set(count() + 1) }],
  ];
};

const ssrState = getSsrState();

hydrate(document, Page, ssrState);
