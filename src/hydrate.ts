import "style.css";

function getData(): { id: number; component: "string"; state: any[] }[] {
  return JSON.parse(document.querySelector('script[type="juno/data"]')?.textContent || "{}");
}

function getRoot(id: number): Element {
  return document.querySelector(`script[juno-id="${id}"]`)?.nextElementSibling!;
}

for (const { id, component, state } of getData()) {
  const root = getRoot(id);
  console.log(root, component, state);
}
