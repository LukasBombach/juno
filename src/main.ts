// todos
// [ ] make the code slightly nicer
// [ ] support different types of children (ie. components)
// [ ] make component by name code acutally load a component from a client bundle
// [ ] make component by name code nice

import { signal } from "@maverick-js/signals";
import { getRoots, getState } from "juno/ssr";
import { applyBinding } from "juno/dom";
import "style.css";

import type { InstanceContext } from "juno/ssr";
import type { DomBinding } from "juno/dom";

const roots = getRoots();
const instances = getState();

const componentsRegister = new Map<string, (props: any, ctx: InstanceContext) => DomBinding[]>();

const Counter = (_props: null, ctx: InstanceContext): DomBinding[] => {
  const count = signal(ctx.state[0]);
  const increment = () => count.set(count() + 1);
  return [
    ["*:nth-child(1)", { onClick: increment }],
    ["*:nth-child(2)", { children: [7, count, 6, count] }],
  ];
};

componentsRegister.set("_az4e", Counter);

const ssr = roots.map(([id, root]) => {
  const component = componentsRegister.get(instances[id].component)!;
  return [root, component, instances[id].state] as const;
});

for (const [root, component, state] of ssr) {
  const ctx = { state };
  const bindings = component(null, ctx);

  bindings.forEach(([selector, props]) => {
    const element = root.querySelector(selector)!;
    applyBinding(element, props);
  });
}
