import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

/**
 * [1] todo | this won't work work with multiple JSX elements like:
 * [1] todo | return condition ? <div /> : <span />;
 */
export function getJsxRoots() {
  return (nodes: Node<"ReturnStatement">[]): [element: Node<"JSXElement">, parents: Node[]][] => {
    return nodes
      .flatMap(node => {
        // [1]
        for (const [child, parents] of traverse(node.argument)) {
          if (child.type === "JSXElement") {
            return [child, parents];
          }
        }
        return undefined;
      })
      .filter(Boolean) as [Node<"JSXElement">, Node[]][];
  };
}
