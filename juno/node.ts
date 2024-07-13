import type * as t from "@swc/types";

export type Node =
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

export type Ancestors = (from: Node) => Generator<Node>;

export type NodeType = Node["type"];

export type GetNode<T extends NodeType> = Extract<Node, { type: T }>;

export type TypeProp<T extends NodeType> = { type: T } & Record<string, unknown>;

export type Option<T> = T | undefined;
