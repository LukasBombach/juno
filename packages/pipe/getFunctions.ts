import type { Node } from "@juno/parse";

export function getFunctions() {
  return (node: Node): Node<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">[] => {
    throw new Error("Not implemented: getFunctions");
  };
}
