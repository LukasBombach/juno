import { pipe } from "fp-ts/function";
import { parse } from "juno/ast";

import type * as t from "@swc/types";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const signalCalls = pipe(
      fn.node,
      children({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      references(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" })
    );
  }

  return src;
}

type Query = Record<string, unknown>;

type Node =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.SpreadElement
  | t.VariableDeclarator
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer;

function children(query: Query) {
  return (node: Node): Node[] => node.children.filter(byQuery(query));
}
