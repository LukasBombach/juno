import type { Node, NodeType } from "juno-ast/parse";
import type { Option } from "juno-ast/pipe";

export function is<T extends NodeType>(type: T): (node: Option<Node>) => Option<Node<T>> {
  return (node): Option<Node<T>> => (node?.type === type ? (node as Node<T>) : undefined);
}

export function exclude<T extends Node>(node: Option<Node>): (nodes: T[]) => T[] {
  return (nodes) => (node ? nodes.filter((n) => n !== node) : nodes);
}
