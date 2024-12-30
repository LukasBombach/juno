import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

/**
 * [1] todo | this won't work work with multiple JSX elements like:
 * [1] todo | return condition ? <div /> : <span />;
 */
export function getJsxRoots() {
  return (nodes: Node<"ReturnStatement">[]): [element: Node<"JSXElement">, parents: Node[]][] => {
    return nodes
      .map(returnStatement => {
        // [1]
        for (const [child, parents] of traverse(returnStatement)) {
          if (child.type === "JSXElement") {
            return [child, parents] as [element: Node<"JSXElement">, parents: Node[]];
          }
        }
        return undefined;
      })
      .filter(n => n !== undefined);
  };
}
