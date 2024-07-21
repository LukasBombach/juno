import { map } from "juno-ast/map";
import type { Node, NodeType } from "juno-ast/parse";

export type Query<T extends NodeType> = { type: T } & Record<string, unknown>;
type QueryResult<Q> = Q extends Query<infer T> ? Node<T> : undefined;

export function getReferences<Q extends Query<NodeType>>() {
  return map<Node, QueryResult<Q>>((node) => {});
}
