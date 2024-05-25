import { getSsrState, hydrate } from "juno/client";
import { msg } from "virtual:juno/client/";
import type { ClientComponent } from "juno/client";

console.log("msg", msg);

const Page: ClientComponent = ctx => {
  const count = ctx.signal(ctx.ssrData[0]);
  return [
    ["1", { children: [count] }],
    ["2", { onClick: () => count.set(count() + 1) }],
  ];
};

const ssrState = getSsrState();

hydrate(document.body, Page, ssrState);
