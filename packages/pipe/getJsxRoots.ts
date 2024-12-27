import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

/**
 * [1] todo | this won't work work with multiple JSX elements like:
 * [1] todo | return condition ? <div /> : <span />;
 */
export function getJsxRoots() {
  return (nodes: Node<"ReturnStatement">[]): Node<"JSXElement">[] => {
    return nodes
      .flatMap((node) => {
        // [1]
        for (const [child] of traverse(node.argument)) {
          if (child.type === "JSXElement") {
            return child;
          }
        }
        return undefined;
      })
      .filter((el): el is Node<"JSXElement"> => el?.type === "JSXElement");
  };
}
