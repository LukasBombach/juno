export default (element: HTMLElement) =>
  async (
    Component: any,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    console.log(element);
    console.log(Component({ ...props, children }));
  };
