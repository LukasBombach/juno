import { pipe } from "juno-ast/pipe";
import { parse } from "juno-ast/parse";
import { findFirst, findAll } from "juno-ast/find";
import { matches } from "lodash";

import type * as t from "@swc/types";
import type { Node, NodeType, GetNode, TypeProp, Option, Ancestors } from "juno/node";
import type { PipeApi } from "juno/pipe";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const { node: fn } of module.find("FunctionExpression")) {
    console.log(
      pipe(module)(
        fn,
        findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
        get("pat"),
        getReferences(),
        parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
        parent({ type: "CallExpression" })
      )
    );
  }

  return src;
}

function parent<Q extends TypeProp<NodeType>>(
  q: Q
): (nodes: Node[], api: PipeApi) => (Q extends TypeProp<infer T> ? GetNode<T> : undefined)[] {
  const { index: queryIndex, ...query } = q;
  const matchQuery = matches(query);
  const isMatchingNode: (node: Node, index: number) => node is Q extends TypeProp<infer U> ? GetNode<U> : Node =
    queryIndex === undefined
      ? (node, _): node is Q extends TypeProp<infer U> ? GetNode<U> : Node => matchQuery(node)
      : (node, index): node is Q extends TypeProp<infer U> ? GetNode<U> : Node =>
          index === queryIndex && matchQuery(node);

  return (nodes: Node[], { ancestors }: PipeApi): (Q extends TypeProp<infer T> ? GetNode<T> : undefined)[] => {
    return nodes.map((node): Q extends TypeProp<infer T> ? GetNode<T> : undefined => {
      for (const child of ancestors(node)) {
        // 💀 todo passing -1 as index is wrong here and could lead to errors
        if (isMatchingNode(child, -1)) {
          // @ts-expect-error WORK IN PROGRESS
          return child;
        }
      }
      // @ts-expect-error WORK IN PROGRESS
      return undefined;
    });
  };
}

function getReferences(): (node: Option<Node>, api: PipeApi) => t.Identifier[] {
  return (node, { pipe }) =>
    pipe(
      node,
      is("Identifier"),
      getScope(),
      findAll({ type: "Identifier", value: (node as t.Identifier).value }),
      exclude(node)
    );
}

function exclude<T extends Node>(node: Option<Node>): (nodes: T[]) => T[] {
  return (nodes) => (node ? nodes.filter((n) => n !== node) : nodes);
}

function getScope(): (node: Option<Node>, api: PipeApi) => Option<t.FunctionExpression | t.Module> {
  return (node, { ancestors }) => (node ? scopes(node, ancestors).next().value : undefined);
}

function* scopes<T = t.FunctionExpression | t.Module>(node: Node, ancestors: Ancestors): Generator<T> {
  const scopeTypes = ["FunctionExpression", "Module"];

  for (const ancestor of ancestors(node)) {
    if (scopeTypes.includes(ancestor.type)) {
      // @ts-expect-error WORK IN PROGRESS
      yield ancestor;
    }
  }
}

function is<T extends NodeType>(type: T): (node: Option<Node>) => Option<GetNode<T>> {
  return (node): Option<GetNode<T>> => (node?.type === type ? (node as GetNode<T>) : undefined);
}

function get<N extends Node, P extends keyof N>(name: P): (node: Option<N>) => Option<N[P]> {
  return (node) => node?.[name];
}
