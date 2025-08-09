import type { Node } from "oxc-parser";

export * from "oxc-parser";

export type NodeType = Node["type"];

export type NodeByType = {
  [K in NodeType]: Extract<Node, { type: K }>;
};

export const functionTypes = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"] as const;

export function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

export function isNodeOfType<T extends NodeType>(node: Node, type: T): node is NodeByType[T] {
  return node.type === type;
}
