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

type TypeQuery<T extends NodeType> = `${string}type=${T}`;
type QueryResult<P extends string> = P extends TypeQuery<infer T> ? Api<NodeOfType<T>> : Api<Node>;

export async function parse(src: string, options?: ParseOptions): Promise<Api<Module>> {
  const module = await swcparse(src, options);
  return new Api(module);
}

class Api<T extends Node> {
  constructor(public node: T) {}

  is<T extends NodeType>(type: T): this is Api<NodeOfType<T>> {
    return this.node.type === type;
  }

  query<T extends string>(query: T): QueryResult<T> | undefined {
    const parts = query.split(".");
    let node: unknown = this.node;

    for (const part of parts) {
      debugger;

      if (part.includes("=")) {
        const [prop, value] = part.split("=");

        if (Api.isNode(node) && prop in node && node[prop as keyof typeof node] === value) {
          node = node;
        } else {
          return undefined;
        }
      } else if (/^\d+$/.test(part) && Array.isArray(node)) {
        node = node[parseInt(part, 10)];
      } else if (typeof node === "object" && node !== null && part in node) {
        node = node[part as keyof typeof node];
      } else {
        return undefined;
      }
    }

    if (Api.isNode(node)) {
      return new Api(node) as QueryResult<T>;
    } else {
      return undefined;
    }
  }

  *find<T extends NodeType>(type: T): Generator<Api<NodeOfType<T>>> {
    for (const node of this.traverse(this.node)) {
      if (node.is(type)) {
        yield node;
      }
    }
  }

  static isNode(value: unknown): value is Node {
    return typeof value === "object" && value !== null && "type" in value;
  }

  private *traverse(obj: any): Generator<Api<Node>> {
    if (typeof obj === "object" && obj !== null && "type" in obj) {
      yield new Api(obj);
    }

    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          yield* this.traverse(obj[i]);
        }
      } else {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            yield* this.traverse(obj[key]);
          }
        }
      }
    }
  }
}
