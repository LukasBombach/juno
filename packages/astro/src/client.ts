export default (element: HTMLElement) =>
  async (...args: unknown[]) => {
    console.log("juno hydrate 111", element, ...args);
  };
