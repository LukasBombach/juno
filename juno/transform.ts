import { parse, print } from "@swc/core";
import type * as t from "@swc/types";

export type Node =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.VariableDeclarator
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer;

export type NodeType = Node["type"];
export type NodeOfType<T extends NodeType> = Extract<Node, { type: T }>;

export async function transformToClientCode(input: string): Promise<string> {
  const module = await parse(input, { syntax: "typescript", tsx: true });
  const { code: output } = await print(module);
  return output;
}

function find<T extends NodeType>(parent: Node, type: T): NodeOfType<T>[] {
  const nodes = new Set<NodeOfType<T>>();
  traverse(parent, (node) => node.type === type && nodes.add(node));
  return Array.from(nodes);
}

function traverse(obj: any, callback: (node: any) => void) {
  callback(obj);

  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) traverse(obj[i], callback);
    } else {
      for (const key in obj) obj.hasOwnProperty(key) && traverse(obj[key], callback);
    }
  }
}
