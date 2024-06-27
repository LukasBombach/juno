import { parse as swcparse } from "@swc/core";
import type { ParseOptions, Module } from "@swc/core";
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
  | t.JSXExpressionContainer;

export type NodeType = Node["type"];
export type NodeOfType<T extends NodeType> = Extract<Node, { type: T }>;

interface Api {
  // find: <T extends NodeType>(type: T) => Generator<Wrapped<NodeOfType<T>>>;
  is: <T extends NodeType>() => this is Wrapped<NodeOfType<T>>;
}

type Wrapped<N extends Node> = N & Api;

export async function parse(src: string, options?: ParseOptions): Promise<Wrapped<Module>> {
  const module = await swcparse(src, options);

  const api = {
    is<T extends NodeType>(target: unknown): (type: T) => target is NodeOfType<T> {
      return (type): target is NodeOfType<T> =>
        typeof target === "object" && target !== null && "type" in target && target.type === type;
    },
  };

  function wrap<T extends Node>(node: T): Wrapped<T> {
    return new Proxy<T>(node, {
      get(target, prop, receiver) {
        if (prop === "is") {
          return api.is(target);
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  return wrap(module);
}

class ApiNode<T> {
  constructor(private node: Node) {}

  is<T extends NodeType>(type: T): this is Wrapped<NodeOfType<T>> {
    return this.node.type === type;
  }
}
