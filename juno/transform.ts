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

  for (const ret of find(module, "ReturnStatement")) {
    const retValue = is(ret.argument, "ParenthesisExpression") ? ret.argument.expression : ret.argument;

    if (!is(retValue, "JSXElement")) {
      continue;
    }

    console.log(retValue);
  }

  const { code: output } = await print(module);
  return output;
}

function* find<T extends NodeType>(parent: Node, type: T): Generator<NodeOfType<T>> {
  for (const node of traverse(parent)) {
    if (is(node, type)) {
      yield node;
    }
  }
}

function* traverse(obj: any): Generator<Node> {
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) yield* traverse(obj[i]);
    } else {
      if ("type" in obj) {
        yield obj;
      }
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) yield* traverse(obj[key]);
      }
    }
  }
}

function is<T extends NodeType>(node: Node | undefined, type: T): node is NodeOfType<T> {
  return node?.type === type;
}
