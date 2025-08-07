console.log("juno hydration script initialized");

export default (element: HTMLElement) =>
  async (
    Component: any,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    console.log("a", element, Component({ ...props, children }), Component, props, children, slotted, client);
  };
