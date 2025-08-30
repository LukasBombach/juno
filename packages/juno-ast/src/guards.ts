import type * as t from "./types";

type MaybeNode = t.Node | null | undefined;

export const is = {
  BinaryExpression: (node: MaybeNode): node is t.BinaryExpression => node?.type === "BinaryExpression",
  UnaryExpression: (node: MaybeNode): node is t.UnaryExpression => node?.type === "UnaryExpression",
  Node: (value: unknown): value is t.Node => typeof value === "object" && value !== null && "type" in value,
  JSXAttribute: (node: MaybeNode): node is t.JSXAttribute => node?.type === "JSXAttribute",
  JSXElement: (node: MaybeNode): node is t.JSXElement => node?.type === "JSXElement",
  JSXIdentifier: (node: MaybeNode): node is t.JSXIdentifier => node?.type === "JSXIdentifier",
  JSXEmptyExpression: (node: MaybeNode): node is t.JSXEmptyExpression => node?.type === "JSXEmptyExpression",
  JSXExpressionContainer: (node: MaybeNode): node is t.JSXExpressionContainer =>
    node?.type === "JSXExpressionContainer",
};

export const not = {
  JSXEmptyExpression: <T extends t.Node>(node: T | t.JSXEmptyExpression): node is T =>
    node.type !== "JSXEmptyExpression",
};

export const as = {
  JSXIdentifier: (node: MaybeNode): t.JSXIdentifier | undefined => (is.JSXIdentifier(node) ? node : undefined),
};

/**
 * legacy type guard
 * @deprecated use is.Node
 */
export function isNode(value: unknown): value is t.Node {
  return typeof value === "object" && value !== null && "type" in value;
}

/**
 * legacy type guard
 * @deprecated
 */
export function isNodeOfType<T extends readonly [t.NodeType | undefined, ...(t.NodeType | undefined)[]]>(
  node: t.Node,
  ...types: T
): node is t.NodeOfType<NonNullable<T[number]>> {
  return types.some(t => t === node.type);
}
