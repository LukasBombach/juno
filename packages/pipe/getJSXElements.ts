import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

export function getJSXElements() {
  return (nodes: Node[]): Node<"JSXElement">[] => {
    return nodes.flatMap(node =>
      traverse(node)
        .map(([n]) => n)
        .filter(n => n.type === "JSXElement")
        .toArray()
    );
  };
}
