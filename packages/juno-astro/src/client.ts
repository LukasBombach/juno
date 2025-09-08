declare global {
  interface Window {
    JUNO_COMPONENTS: Record<string, Function>;
  }
}

window.JUNO_COMPONENTS = {};

interface Hydration {
  id: string;
  ref?: (el: Element) => void;
}

export default (element: HTMLElement) =>
  async (
    Component: any,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    const componentRoots = element.querySelectorAll(`[data-component-id]`);

    for (const root of componentRoots) {
      const id = root.getAttribute("data-component-id");
      if (id && window.JUNO_COMPONENTS[id]) {
        const Comp = window.JUNO_COMPONENTS[id];
        const hydrations: Hydration[] = await Comp({ ...props, children, ...slotted }).flat(Infinity);

        console.dir(hydrations);

        const hydratedElementsCount: Record<string, number> = {};

        for (const h of hydrations) {
          const elements = [...root.querySelectorAll(`[data-element-id="${h.id}"]`)];

          if (root.getAttribute("data-element-id") === h.id) {
            elements.unshift(root);
          }

          // todo this code is so bad
          hydratedElementsCount[h.id] = (hydratedElementsCount[h.id] || 0) + 1;
          const el = elements[hydratedElementsCount[h.id] - 1];

          if (!el) {
            console.warn("Cannot find element with id", h.id, "in", root);
            return;
          }

          if (el) {
            for (const [name, value] of Object.entries(h)) {
              if (name === "ref") value(el);
              if (name.match(/^on[A-Z]/)) el.addEventListener(name.slice(2).toLowerCase(), value);
            }
          }
        }
      } else {
        console.warn("Cannot find component", id, "in window.JUNO_COMPONENTS");
        console.dir(window.JUNO_COMPONENTS);
      }
    }
  };
