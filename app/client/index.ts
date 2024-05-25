import { getSsrState, hydrate } from "juno/client";
import file from "virtual:juno/client/app/pages/index";
import type { ClientComponent } from "juno/client";

console.log(file);

const Page: ClientComponent = (ctx) => {
  const count = ctx.signal(ctx.ssrData[0]);
  return [
    ["1", { children: [count] }],
    ["2", { onClick: () => count.set(count() + 1) }],
  ];
};

const ssrState = getSsrState();

hydrate(document.body, Page, ssrState);
