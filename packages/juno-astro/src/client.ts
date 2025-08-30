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
    // console.log(element);
    // console.log(Component({ ...props, children }));

    const componentRoots = element.querySelectorAll(`[data-component-id]`);
    // console.log(...componentRoots);

    for (const root of componentRoots) {
      const id = "_" + root.getAttribute("data-component-id");
      if (id && window.JUNO_COMPONENTS[id]) {
        const Comp = window.JUNO_COMPONENTS[id];
        const hydrations: Hydration[] = await Comp({ ...props, children, ...slotted });
        // console.log(...hydrations);

        for (const h of hydrations) {
          const el =
            root.getAttribute("data-element-id") === h.id ? root : root.querySelector(`[data-element-id="${h.id}"]`);
          if (el && h.ref) {
            h.ref(el);
          }
        }
      } else {
        console.warn("No component found for id", id, window.JUNO_COMPONENTS, root);
      }
    }
  };
