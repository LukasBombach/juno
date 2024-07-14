import { pipe } from "juno/pipe";
import { parse } from "juno/ast";
import { matches } from "lodash";

import type * as t from "@swc/types";
import type { Node, NodeType, GetNode, TypeProp, Option, Ancestors } from "juno/node";
import type { PipeApi } from "juno/pipe";

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

    console.log("\n-----\n\n", signalCalls);
  }

  return src;
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

function findAll<Q extends TypeProp<NodeType>>(
  q: Q
): (node: Option<Node>) => (Q extends TypeProp<infer T> ? GetNode<T> : Node)[] {
  const { index: queryIndex, ...query } = q;
  const matchQuery = matches(query);
  const isMatchingNode: (node: Node, index: number) => node is Q extends TypeProp<infer U> ? GetNode<U> : Node =
    queryIndex === undefined
      ? (node, _): node is Q extends TypeProp<infer U> ? GetNode<U> : Node => matchQuery(node)
      : (node, index): node is Q extends TypeProp<infer U> ? GetNode<U> : Node =>
          index === queryIndex && matchQuery(node);

  return (node: Option<Node>): (Q extends TypeProp<infer T> ? GetNode<T> : Node)[] => {
    const matches: (Q extends TypeProp<infer T> ? GetNode<T> : Node)[] = [];
    if (node) {
      for (const [child, , , index] of traverse(node)) {
        if (isMatchingNode(child, index)) {
          matches.push(child);
        }
      }
    }
    return matches;
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
      // console.log(parent.type.padStart(15, " "), ">", child.type);
      yield* traverse(child);
    }
    if (Array.isArray(child)) {
      for (const i in child) {
        const nthChild = child[i];
        if (isNode(nthChild)) {
          yield [nthChild, parent, property, parseInt(i, 10)];
          // console.log(parent.type.padStart(15, " "), ">", nthChild.type);
          yield* traverse(nthChild);
        }
      }
    }
  }
}
