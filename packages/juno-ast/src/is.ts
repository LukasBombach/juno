import type * as t from "./types";

export const is = {
  jsxIdentifier: (node: t.Node): node is t.JSXIdentifier => node.type === "JSXIdentifier",
};
