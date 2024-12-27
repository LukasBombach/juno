import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

export function getReturnStatements() {
  return (nodes: Node[]): Node<"ReturnStatement">[] => {
    return nodes.flatMap((node) =>
      Array.from(traverse(node))
        .map(([n]) => n)
        .filter((n) => n.type === "ReturnStatement")
    );
  };
}
