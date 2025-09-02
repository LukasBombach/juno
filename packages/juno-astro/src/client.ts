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
      const id = "_" + root.getAttribute("data-component-id");
      if (id && window.JUNO_COMPONENTS[id]) {
        const Comp = window.JUNO_COMPONENTS[id];
        const hydrations: Hydration[] = await Comp({ ...props, children, ...slotted });

        for (const h of hydrations) {
          const el =
            root.getAttribute("data-element-id") === h.id ? root : root.querySelector(`[data-element-id="${h.id}"]`);
          if (el) {
            for (const [name, value] of Object.entries(h)) {
              if (name === "ref") value(el);
              if (name.match(/^on[A-Z]/)) el.addEventListener(name.slice(2).toLowerCase(), value);
            }
          }
        }
      } else {
        console.warn("No component found for id", id, window.JUNO_COMPONENTS, root);
      }
    }
  };
