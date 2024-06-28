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
  return new Api(module, Api.mapParents(module));
}

class Api<T extends Node> {
  constructor(public readonly node: T, private readonly parents: Map<Node, Node>) {}

  is<T extends NodeType>(type: T): this is Api<NodeOfType<T>>;
  is<T extends NodeType>(...type: T[]): this is Api<NodeOfType<T>>;
  is<T extends NodeType>(type: T | T[]): this is Api<NodeOfType<T>> {
    return Array.isArray(type) ? type.some(t => (this.node.type = t)) : this.node.type === type;
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
      return new Api(node, this.parents) as QueryResult<T>;
    } else {
      return undefined;
    }
  }

  findScope(): Api<t.FunctionExpression | t.Module> {
    return [...this.findParents()].filter((node): node is Api<t.FunctionExpression | t.Module> =>
      node.is("FunctionExpression", "Module")
    )[0];
  }

  *findParents(): Generator<Api<Node>> {
    let parent = this.parents.get(this.node);
    while (parent) {
      yield new Api(parent, this.parents);
      parent = this.parents.get(parent);
    }
  }

  *findUsages(): Generator<Api<t.Identifier>> {
    if (!this.is("Identifier")) return;
    const scope = this.findScope();
    console.log(scope.node.type);
    for (const id of scope.find("Identifier")) {
      if (id.node !== this.node && id.node.value === this.node.value) yield id;
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

  static mapParents(node: Node, parents = new Map<Node, Node>()): Map<Node, Node> {
    let parent = node;
    let property: keyof typeof parent;

    for (property in parent) {
      const child = parent[property];
      if (Api.isNode(child)) {
        parents.set(child, parent);
        this.mapParents(child, parents);
      }
      if (Array.isArray(child)) {
        for (const nthChild of child) {
          if (Api.isNode(nthChild)) {
            parents.set(nthChild, parent);
            this.mapParents(nthChild, parents);
          }
        }
      }
    }

    return parents;
  }

  private *traverse(obj: any): Generator<Api<Node>> {
    if (typeof obj === "object" && obj !== null && "type" in obj) {
      yield new Api(obj, this.parents);
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
