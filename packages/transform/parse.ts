import { parse as swcparse, print as swcprint } from "@swc/core";
import type { ParseOptions, Options as PrintOptions } from "@swc/core";
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
  | t.JSXSpreadChild
  | t.Param
  | t.Pattern;

export type Node<T = void> = T extends NodeType ? NodeTypeMap[T] : AnyNode /*  | t.Argument */;

export type NodeType = AnyNode["type"];

export type NodeTypeMap = {
  [K in NodeType]: Extract<Node, { type: K }>;
};

export async function parse(src: string, options?: ParseOptions): Promise<t.Module> {
  return await swcparse(src, options);
}

export async function print(program: t.Program, options?: PrintOptions): Promise<string> {
  return (await swcprint(program, options)).code;
}

export function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}
