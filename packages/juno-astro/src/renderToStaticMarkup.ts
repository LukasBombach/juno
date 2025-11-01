import { vnode, type VNode } from "./jsxRuntime";

export async function renderToStaticMarkup(asyncNode: Promise<VNode> | VNode): Promise<string> {
  const node = await asyncNode;
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

  const childrenArray = ensureArray(children).flat(Infinity);

  let innerHTML: string = "";

  for (let child of childrenArray) {
    child = child instanceof Promise ? await child : child;
    if (isVNode(child)) {
      innerHTML += await renderToStaticMarkup(child);
    } else if (shouldBeRenderedToString(child)) {
      innerHTML += String(child);
    } else if (shouldBeSkipped(child)) {
      // Skip rendering this child
    } else {
      console.warn("Unsupported child type for static rendering:", child);
    }
  }

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

function shouldBeSkipped(value: unknown): boolean {
  return value === null || value === undefined || typeof value === "boolean";
}
