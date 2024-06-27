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

  getNode(prop: string): Node | undefined {
    const val = this.node[prop as keyof T] as unknown;
    return Api.isNode(val) ? val : undefined;
  }

  query<T extends string>(query: T): QueryResult<T> | undefined {
    const parts = query.split(".");
    let node: Node = this.node;

    for (const part of parts) {
      if (part.includes("=")) {
        const [prop, value] = part.split("=");
        if (this.node[prop as keyof T] === value) {
          node = this.node;
        } else {
          return undefined;
        }
      } else {
        const maybeNode = this.getNode(part);
        if (maybeNode) {
          node = maybeNode;
        } else {
          return undefined;
        }
      }
    }

    return node as any;
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
