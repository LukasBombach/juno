export { importClientComponent as importComponent } from "juno/compiler";

export function getData(): any[] {
  const text = document.body.querySelector("script[type='juno/data']")?.textContent || "[]";
  return JSON.parse(text);
}

export function hydrate(component: { selectors: string[] }, root: HTMLElement) {
  const data = getData();
  const elements = component.selectors.map((s) => root.querySelector(s));
  // bind(elements, component, data);
}
