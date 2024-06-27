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

  /* static isNode(value: unknown): value is Node {
    return typeof value === "object" && value !== null && "type" in value;
  }

  has(prop: PropertyKey): prop is keyof T {
    return this.node.hasOwnProperty(prop);
  }

  isNode(prop: keyof T): boolean {
    return Api.isNode(this.node[prop]);
  } */

  getNode(prop: string): Node | undefined {
    if (
      prop in this.node &&
      typeof this.node[prop] === "object" &&
      this.node[prop] !== null &&
      "type" in this.node[prop]
    ) {
      return this.node[prop];
    }
    return undefined;
  }

  query<T extends string>(query: T): QueryResult<T> | undefined {
    const parts = query.split(".");
    let node: Node = this.node;

    for (const part of parts) {
      const maybeNode = this.getNode(part);
      if (maybeNode) {
        node = maybeNode;
      } else {
        return undefined;
      }
    }

    return node;

    /* const property = query.split(".")[0];
    const [key, value] = property.split("=");

    if (key && value && this.node[key as keyof Node] === value) {
      return this.node as any; // TODO ANY;
    } */
  }

  *find<T extends NodeType>(type: T): Generator<Api<NodeOfType<T>>> {
    for (const node of this.traverse(this.node)) {
      if (node.is(type)) {
        yield node;
      }
    }
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
