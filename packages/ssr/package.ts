import { signal } from "@maverick-js/signals";

import type { ReactElement, ReactNode } from "react";
import type { WriteSignal } from "@maverick-js/signals";

export interface RenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
}

export function renderToString(node: ReactNode | ((ctx: RenderContext) => ReactNode)): string {
  if (typeof node === "boolean") {
    return "";
  }

  if (node === null) {
    return "";
  }

  if (typeof node === "undefined") {
    return "";
  }

  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number") {
    return node.toString();
  }

  if (Array.isArray(node)) {
    throw new Error("not yet implemented");
  }

  if (isReactElement(node)) {
    if (typeof node.type === "string") {
      const attrs: string[] = [];
      const children: string[] = [];

      const docType = node.type === "html" ? "<!DOCTYPE html>" : "";

      for (let [key, val] of Object.entries(node.props)) {
        if (key.match(/^on[A-Z]/)) {
          // attrs.push(`${key}="--omit--"`);
          continue;
        }

        if (typeof val === "function") {
          val = val();
        }

        if (key === "className") {
          key = "class";
        }

        if (key === "children") {
          const vals = Array.isArray(val) ? val : [val];
          children.push(...vals.map(renderToString));
        } else {
          attrs.push(`${key}="${val}"`);
        }
      }

      if (node.props.children) {
        return `${docType}<${[node.type, ...attrs].join(" ")}>${children.join("")}</${node.type}>`;
      } else if (node.type === "script") {
        return `${docType}<${[node.type, ...attrs].join(" ")}></${node.type}>`;
      }
      {
        return `${docType}<${[node.type, ...attrs].join(" ")} />`;
      }
    }

    if (typeof node.type == "function") {
      return renderToString(node.type(node.props));
    }
  }

  if (typeof node === "function") {
    return renderToString(node({ signal }));
  }

  console.warn(`Cannot handle react element type ${typeof node}`, node);
  return "";
}

function isReactElement(
  val: any
): val is ReactElement<Record<string, unknown>, string | ((props: Record<string, unknown>) => ReactNode)> {
  return typeof val === "object" && val !== null && "type" in val && "props" in val;
}
