import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

export function getJSXElements() {
  return (nodes: Node[]): [el: Node<"JSXElement">, parents: Node[]][] => {
    return nodes.flatMap(node =>
      Array.from(traverse(node)).filter(
        (r): r is [el: Node<"JSXElement">, parents: Node[]] => r[0].type === "JSXElement"
      )
    );
  };
}
