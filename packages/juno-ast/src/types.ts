import type { Node } from "oxc-parser";

export type * from "oxc-parser";
export type NodeType = Node["type"];
export type NodeOfType<T extends NodeType, N extends Node = Node> = N extends { type: T } ? N : never;

export function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

export function isNodeOfType<T extends readonly [NodeType | undefined, ...(NodeType | undefined)[]]>(
  node: Node,
  ...types: T
): node is NodeOfType<NonNullable<T[number]>> {
  return types.some(t => t === node.type);
}
