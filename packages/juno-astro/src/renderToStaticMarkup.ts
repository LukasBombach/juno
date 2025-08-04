import { vnode, type VNode } from "./jsxRuntime";

export function renderToStaticMarkup(node: VNode): string {
  const tag = node.type;
  const { children, ...props } = node.props;

  const attributes = Object.entries(props).map(([key, value]) => {
    const name = key === "className" ? "class" : key;
    return value === true ? name : `${name}="${value}"`;
  });

  const openingTag = `<${[tag, ...attributes].join(" ")}>`;
  const closingTag = `</${tag}>`;

  const innerHTML = ensureArray(children)
    .map(child => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      } else if (isVNode(child)) {
        return renderToStaticMarkup(child);
      }
      return undefined;
    })
    .filter(child => child !== undefined)
    .join("");

  return `${openingTag}${innerHTML}${closingTag}`;
}

function ensureArray<V>(value: V | V[]): V[] {
  return Array.isArray(value) ? value : [value];
}

function isVNode(node: VNode["props"]["children"]): node is VNode {
  return Boolean(node) && typeof node === "object" && node !== null && vnode in node;
}
