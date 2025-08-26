declare global {
  interface Window {
    JUNO_COMPONENTS: Record<string, Function>;
  }
}

window.JUNO_COMPONENTS = {};

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
    console.log(...componentRoots);

    for (const root of componentRoots) {
      const id = "_" + root.getAttribute("data-component-id");
      if (id && window.JUNO_COMPONENTS[id]) {
        const Comp = window.JUNO_COMPONENTS[id];
        const comp = await Comp({ ...props, children, ...slotted });
        console.log(comp);
      } else {
        console.warn("No component found for id", id, window.JUNO_COMPONENTS, root);
      }
    }
  };
