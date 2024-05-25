import { getSsrState, hydrate } from "juno/client";

import type { WriteSignal } from "@maverick-js/signals";
import type { HydrationDirectives } from "juno/compiler";

export interface ClientRenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
  ssrData: any[];
}

export interface ClientComponent {
  (ctx: ClientRenderContext): [path: string, directives: HydrationDirectives][];
  id: string;
}

const Page: ClientComponent = ctx => {
  const count = ctx.signal(ctx.ssrData[0]);
  return [
    ["1", { children: [count] }],
    ["2", { onClick: () => count.set(count() + 1) }],
  ];
};
Page.id = "index";

const ssrState = getSsrState();

hydrate(document.body, Page, ssrState);
