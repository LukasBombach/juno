import { map } from "juno-ast/map";
import type { Node, NodeType } from "juno-ast/parse";

export type Query<T extends NodeType> = { type: T } & Record<string, unknown>;
type QueryResult<Q> = (Q extends Query<infer T> ? Node<T> : Node) | undefined;

export function findFirst<Q extends Query<NodeType>>(query: Q) {
  return map<Node, QueryResult<Q>>((node) => {});
}

export function findAll<Q extends Query<NodeType>>(query: Q) {
  return map<Node, QueryResult<Q>[]>((node) => {});
}

export function parent<Q extends Query<NodeType>>(query: Q) {
  return map<Node, QueryResult<Q>>((node) => {});
}
