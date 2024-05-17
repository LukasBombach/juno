export { importClientComponent as importComponent } from "juno/compiler";

export function $(q: string) {
  return document.querySelector(q)!;
}

export function getData(): any[] {
  const text = $("script[type='juno/data']").textContent || "[]";
  return JSON.parse(text);
}

export function hydrate(component: any) {
  const data = getData();
  const elements = component.selectors.map((s: string) => $(s));
  bind(elements, component, data);
}
