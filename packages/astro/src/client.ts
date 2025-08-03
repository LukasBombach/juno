export default (element: HTMLElement) =>
  async (...args: unknown[]) => {
    console.log("juno hydrate ppp", element, ...args);
  };
