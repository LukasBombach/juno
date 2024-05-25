import { getSsrState, hydrate } from "juno/client";
import type { ClientComponent } from "juno/client";

const Page: ClientComponent = ctx => {
  const count = ctx.signal(ctx.ssrData[0]);
  return [
    ["1", { children: [count] }],
    ["2", { onClick: () => count.set(count() + 1) }],
  ];
};

const ssrState = getSsrState();

hydrate(document.body, Page, ssrState);
