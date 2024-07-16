import { parse as swcparse } from "@swc/core";
import type { ParseOptions } from "@swc/core";
import type * as t from "@swc/types";

type Nodes =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.SpreadElement
  | t.VariableDeclarator
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer;

export type Node<T> = T extends NodeType ? Extract<Nodes, { type: T }> : Nodes;

export type NodeType = Nodes["type"];

export async function parse(src: string, options?: ParseOptions): Promise<t.Module> {
  return await swcparse(src, options);
}
