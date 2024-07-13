import { pipe } from "juno/pipe";
import { parse } from "juno/ast";
import { matches } from "lodash";

import type * as t from "@swc/types";
import type { Node, NodeType, GetNode, TypeProp, Option, Ancestors } from "juno/node";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const { node: fn } of module.find("FunctionExpression")) {
    const signalCalls = pipe(module.node)(
      fn,
      findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      get("pat"),
      getReferences()
      // parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      // parent({ type: "CallExpression" })
    );

    console.log("Signal calls\n-----\n", signalCalls);
  }

  return src;
}

function getReferences(): (node: Option<Node>, ancestors: Ancestors) => t.Identifier[] {
  // @ts-expect-error WORK IN PROGRESS
  return (node, ancestors) => {
    if (node) {
      console.log([...ancestors(node)].map((n) => n.type));
    }
    return node;
  };
}

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

export function mapAncestors(module: t.Module): Map<Node, Node> {
  const ancestors = new Map<Node, Node>();
  for (const [child, parent] of traverse(module)) ancestors.set(child, parent);
  return ancestors;
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
