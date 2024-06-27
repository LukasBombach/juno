import { getSsrState, hydrate } from "juno/client";
import file from "app/pages/index?juno";
import type { ClientComponent } from "juno/client";

console.log(file.toString());

const Page: ClientComponent = (ctx) => {
  const count = ctx.signal(ctx.ssrData[0]);
  return [
    [[2, 1], { children: [count] }],
    [[2, 2], { onClick: () => count.set(count() + 1) }],
  ];
};

const ssrState = getSsrState();

hydrate(document, Page, ssrState);
