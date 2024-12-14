import type { Node } from "@juno/parse";

export function filterInteractive() {
  return (nodes: Node<"JSXElement">[]): Node<"JSXElement">[] => {
    throw new Error("Not implemented: filterInteractive");
  };
}
