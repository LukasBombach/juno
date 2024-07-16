import { pipe } from "juno-ast/pipe";
import { parse } from "juno-ast/parse";
import { findFirst, findAll } from "juno-ast/find";
import { matches } from "lodash";

import type * as t from "@swc/types";
import type { Node, NodeType } from "juno-ast/parse";
import type { PipeApi, Option, Ancestors } from "juno-ast/pipe";

type Query<T extends NodeType> = { type: T } & Record<string, unknown>;

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  pipe(module)(module, findAll({ type: "FunctionExpression" }), (fn, { pipe }) => {
    console.log(
      pipe(
        fn,
        findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
        get("pat"),
        getReferences(),
        parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
        parent({ type: "CallExpression" })
      )
    );
  });

  return src;
}

function parent<Q extends Query<NodeType>>(
  q: Q
): (nodes: Node[], api: PipeApi) => (Q extends Query<infer T> ? Node<T> : undefined)[] {
  const { index: queryIndex, ...query } = q;
  const matchQuery = matches(query);
  const isMatchingNode: (node: Node, index: number) => node is Q extends Query<infer U> ? Node<U> : Node =
    queryIndex === undefined
      ? (node, _): node is Q extends Query<infer U> ? Node<U> : Node => matchQuery(node)
      : (node, index): node is Q extends Query<infer U> ? Node<U> : Node => index === queryIndex && matchQuery(node);

  return (nodes: Node[], { ancestors }: PipeApi): (Q extends Query<infer T> ? Node<T> : undefined)[] => {
    return nodes.map((node): Q extends Query<infer T> ? Node<T> : undefined => {
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

function is<T extends NodeType>(type: T): (node: Option<Node>) => Option<Node<T>> {
  return (node): Option<Node<T>> => (node?.type === type ? (node as Node<T>) : undefined);
}

function get<N extends Node, P extends keyof N>(name: P): (node: Option<N>) => Option<N[P]> {
  return (node) => node?.[name];
}
