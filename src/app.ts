import { signal } from "@maverick-js/signals";
import { getRoots, getState } from "juno/ssr";
import { applyBinding } from "juno/dom";

import type { InstanceContext } from "juno/ssr";
import type { DomBinding } from "juno/dom";

function getInstances(): [root: Element, componentId: string, data: any[]][] {
  const data = getState();
  const roots = getRoots();

  return roots.map(([id, root]) => {
    return [root, data[id].component, data[id].state] as const;
  });
}

interface HydrationComponent {
  (_props: null, ctx: InstanceContext): DomBinding[];
  id: string;
}

const Counter: HydrationComponent = (_props, ctx) => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    ["*:nth-child(1)", { onClick: increment }],
    ["*:nth-child(2)", { children: [7, count, 6, count] }],
  ];
};
Counter.id = "_az4e";

const components = new Map<string, HydrationComponent>([[Counter.id, Counter]]);

for (const [root, componentId, data] of getInstances()) {
  const component = components.get(componentId)!;
  const bindings = component(null, { state: data });
  bindings.forEach(([selector, props]) => {
    const element = root.querySelector(selector)!;
    applyBinding(element, props);
  });
}
