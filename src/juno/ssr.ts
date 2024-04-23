export interface InstanceContext {
  state: any[];
}

export function getState() {
  return JSON.parse(document.querySelector('script[type="juno/data"]')?.textContent || "{}");
}

export function getRoots() {
  const instances = [...document.querySelectorAll('script[type="juno/instance"]')].map((marker) => {
    const id = marker.getAttribute("juno-id");
    const root = marker.nextElementSibling;

    if (!id) {
      throw new Error("Id is missing");
    }

    if (!root) {
      throw new Error("Root element is missing");
    }

    return [id, root];
  });

  return Object.fromEntries(instances);
}
