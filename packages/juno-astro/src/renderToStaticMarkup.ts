import { vnode, type VNode } from "./jsxRuntime";

export function renderToStaticMarkup(node: VNode): string {
  const tag = node.type;
  const { children, ...props } = node.props;

  const attributes = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== null && value !== false && typeof value !== "function")
    .map(([key, value]) => {
      const name = key === "className" ? "class" : key;
      return value === true ? name : `${name}="${value}"`;
    });

  const openingTag = `<${[tag, ...attributes].join(" ")}>`;
  const closingTag = `</${tag}>`;

  const innerHTML = ensureArray(children)
    .map(child => {
      // if (isVNode(child)) console.log(child);
      if (isVNode(child)) return renderToStaticMarkup(child);
      if (shouldBeRenderedToString(child)) return String(child);
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

function shouldBeRenderedToString(value: unknown): boolean {
  return ["string", "number", "bigint", "object", "function"].includes(typeof value);
}
