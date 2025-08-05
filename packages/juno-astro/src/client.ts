console.log("juno hydration script initialized");

export default (element: HTMLElement) =>
  async (...args: unknown[]) => {
    console.log("hydrating", element, ...args);
  };
