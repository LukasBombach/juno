import { parse as swcparse } from "@swc/core";
import type { ParseOptions } from "@swc/core";
import type * as t from "@swc/types";

type AnyNode =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.SpreadElement
  | t.VariableDeclarator
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer
  | t.Param
  | t.Pattern;

export type Node<T = void> = T extends NodeType ? Extract<AnyNode, { type: T }> : AnyNode;

export type NodeType = AnyNode["type"];

export async function parse(src: string, options?: ParseOptions): Promise<t.Module> {
  return await swcparse(src, options);
}

export function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}
