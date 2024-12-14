import type { Node } from "@juno/parse";

export function getJSXElements() {
  return (nodes: Node[]): Node<"JSXElement">[] => {
    throw new Error("Not implemented: getJSXElements");
  };
}
