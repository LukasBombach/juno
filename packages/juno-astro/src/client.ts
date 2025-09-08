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
        const hydrations: (Hydration | Hydration[])[] = await Comp({ ...props, children, ...slotted });

        console.dir(hydrations);

        for (const h of hydrations) {
          if (Array.isArray(h)) {
            h.forEach((hh, i) => hydrateElement(root, hh, i));
          } else {
            hydrateElement(root, h, 0);
          }
        }
      } else {
        console.warn("Cannot find component", id, "in window.JUNO_COMPONENTS");
        console.dir(window.JUNO_COMPONENTS);
      }
    }
  };

function hydrateElement(root: Element, h: Hydration, index: number) {
  //const el = root.getAttribute("data-element-id") === h.id ? root : root.querySelector(`[data-element-id="${h.id}"]`);

  const elements = [...root.querySelectorAll(`[data-element-id="${h.id}"]`)];
  if (root.getAttribute("data-element-id") === h.id) {
    elements.unshift(root);
  }

  const el = elements[index];

  if (!el) {
    console.warn("Cannot find element with id", h.id, "at index", index, "in", root);
    return;
  }

  if (el) {
    for (const [name, value] of Object.entries(h)) {
      if (name === "ref") value(el);
      if (name.match(/^on[A-Z]/)) el.addEventListener(name.slice(2).toLowerCase(), value);
    }
  }
}
