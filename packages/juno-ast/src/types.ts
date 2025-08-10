import type { Node } from "oxc-parser";

export * from "oxc-parser";

export type NodeType = Node["type"];

export type NodeByType<T extends NodeType, N extends Node = Node> = N extends { type: T } ? N : never;

export function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

export function isNodeOfType<T extends readonly [NodeType | undefined, ...(NodeType | undefined)[]]>(
  node: Node,
  ...types: T
): node is NodeByType<NonNullable<T[number]>> {
  return types.some(t => t === node.type);
}
