import type * as t from "./types";

type MaybeNode = t.Node | null | undefined;

export const is = {
  jsxIdentifier: (node: MaybeNode): node is t.JSXIdentifier => node?.type === "JSXIdentifier",
  JSXEmptyExpression: (node: MaybeNode): node is t.JSXEmptyExpression => node?.type === "JSXEmptyExpression",
  JSXExpressionContainer: (node: MaybeNode): node is t.JSXExpressionContainer =>
    node?.type === "JSXExpressionContainer",
};

export const not = {
  JSXEmptyExpression: <T extends t.Node>(node: T | t.JSXEmptyExpression): node is T =>
    node.type !== "JSXEmptyExpression",
};
