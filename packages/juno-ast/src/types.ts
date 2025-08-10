import type { Node } from "oxc-parser";

export * from "oxc-parser";

export type NodeType = Node["type"];

export type NodeByType<T extends NodeType> = Extract<Node, { type: T }>;

export function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

export function isNodeOfType<T extends NodeType>(node: Node, type: T): node is NodeByType<T> {
  return node.type === type;
}
