export default (element: HTMLElement) =>
  async (...args: unknown[]) => {
    console.log("juno hydrate", element, ...args);
  };
