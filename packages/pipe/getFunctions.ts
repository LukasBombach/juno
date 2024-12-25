import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

type FunctionType = (typeof functionTypes)[number];

const functionTypes = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"] as const;

export function getFunctions() {
  return (node: Node): Node<FunctionType>[] => {
    return traverse(node)
      .map(([n]) => n)
      .filter(isFunctionType)
      .toArray();
  };
}

function isFunctionType(node: Node): node is Node<FunctionType> {
  return functionTypes.includes(node.type as FunctionType);
}
