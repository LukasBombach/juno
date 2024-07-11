import { pipe } from "fp-ts/function";
import { parse } from "juno/ast";
import { matches } from "lodash";

import type * as t from "@swc/types";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const { node: fn } of module.find("FunctionExpression")) {
    const signalCalls = pipe(
      fn,
      findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      get("pat"),
      getReferences()
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
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer
  | t.Param
  | t.Pattern;

type NodeType = Node["type"];
type GetNode<T extends NodeType> = Extract<Node, { type: T }>;
type TypeProp<T extends NodeType> = { type: T } & Record<string, unknown>;
type Option<T> = T | undefined;

function getReferences(): (node: Option<Node>) => t.Identifier[] {}

function findFirst<Q extends TypeProp<NodeType>>(
  q: Q
): (node: Node) => Option<Q extends TypeProp<infer T> ? GetNode<T> : Node> {
  const { index: queryIndex, ...query } = q;

  const matchQuery = matches(query);

  const isMatchingNode: (node: Node, index: number) => node is Q extends TypeProp<infer U> ? GetNode<U> : Node =
    queryIndex === undefined
      ? (node, _): node is Q extends TypeProp<infer U> ? GetNode<U> : Node => matchQuery(node)
      : (node, index): node is Q extends TypeProp<infer U> ? GetNode<U> : Node =>
          index === queryIndex && matchQuery(node);

  return (node: Node): Option<Q extends TypeProp<infer T> ? GetNode<T> : Node> => {
    for (const [child, , , index] of traverse(node)) {
      if (isMatchingNode(child, index)) {
        return child;
      }
    }
    return undefined;
  };
}

function get<N extends Node, P extends keyof N>(name: P): (node: Option<N>) => Option<N[P]> {
  return (node) => node?.[name];
}

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

function* traverse(current: Node): Generator<[node: Node, parent: Node, property: string, index: number]> {
  let parent = current;
  let property: keyof typeof parent;

  for (property in parent) {
    const child = parent[property];
    if (isNode(child)) {
      yield [child, parent, property, -1];
      yield* traverse(child);
    }
    if (Array.isArray(child)) {
      for (const i in child) {
        const nthChild = child[i];
        if (isNode(nthChild)) {
          yield [nthChild, parent, property, parseInt(i, 10)];
          yield* traverse(nthChild);
        }
      }
    }
  }
}
