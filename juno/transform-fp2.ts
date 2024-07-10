import { pipe } from "fp-ts/function";
import { parse } from "juno/ast";
import { matches } from "lodash";

import type * as t from "@swc/types";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const signalCalls = pipe(
      fn.node,
      findAll({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      get("pat")
      // references(),
      // parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      // parent({ type: "CallExpression" })
    );

    console.log(signalCalls);
  }

  return src;
}

type Node =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.SpreadElement
  | t.VariableDeclarator
  | t.Param
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer;

type NodeType = Node["type"];
type GetNode<T extends NodeType> = Extract<Node, { type: T }>;
type TypeProp<T extends NodeType> = { type: T } & Record<string, unknown>;

function findAll<Q extends TypeProp<NodeType>>({
  index: queryIndex,
  ...query
}: Q): (node: Node) => (Q extends TypeProp<infer T> ? GetNode<T> : Node)[] {
  const matchQuery = matches(query);

  const isMatchingNode: (node: Node, index: number) => node is Q extends TypeProp<infer U> ? GetNode<U> : Node =
    queryIndex === undefined
      ? (node, index): node is Q extends TypeProp<infer U> ? GetNode<U> : Node => matchQuery(node)
      : (node, index): node is Q extends TypeProp<infer U> ? GetNode<U> : Node =>
          index === queryIndex && matchQuery(node);

  return (node: Node): (Q extends TypeProp<infer T> ? GetNode<T> : Node)[] => {
    const children: (Q extends TypeProp<infer T> ? GetNode<T> : Node)[] = [];
    traverseWithParent(node, (child, _, __, index) => isMatchingNode(child, index) && children.push(child));
    return children;
  };
}

function get<N extends Node, P extends keyof N>(name: P): (nodes: N[]) => N[P][] {
  return (nodes: Node[]) => nodes.map((node) => (isKeyOf(node, name) ? node[name] : undefined)).filter(nonNullable);
}

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

function traverseWithParent(
  current: Node,
  callback: (node: Node, parent: Node, property: string, index: number) => void
): void {
  let parent = current;
  let property: keyof typeof parent;

  for (property in parent) {
    const child = parent[property];
    if (isNode(child)) {
      callback(child, parent, property, -1);
      traverseWithParent(child, callback);
    }
    if (Array.isArray(child)) {
      for (const i in child) {
        const nthChild = child[i];
        if (isNode(nthChild)) {
          callback(nthChild, parent, property, parseInt(i, 10));
          traverseWithParent(nthChild, callback);
        }
      }
    }
  }
}

function isKeyOf<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj;
}

function nonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function* traverse(obj: any): Generator<Node> {
  if (typeof obj === "object" && obj !== null && "type" in obj) {
    yield obj;
  }

  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        yield* traverse(obj[i]);
      }
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          yield* traverse(obj[key]);
        }
      }
    }
  }
}
