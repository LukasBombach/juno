import { matches } from "lodash";
import { traverse } from "juno-ast/traverse";

import type { Query } from "juno-ast/query";
import type { Option } from "juno-ast/pipe";
import type { Node, NodeType } from "juno-ast/parse";

export function findAll<Q extends Query<NodeType>>(
  q: Q
  // 💀 todo is should return Node<T>[] here
): (node: Option<Node>) => (Q extends Query<infer T> ? Node<T> : Node)[] {
  const { index: queryIndex, ...query } = q;
  const matchQuery = matches(query);
  const isMatchingNode: (node: Node, index: number) => node is Q extends Query<infer U> ? Node<U> : Node =
    queryIndex === undefined
      ? (node, _): node is Q extends Query<infer U> ? Node<U> : Node => matchQuery(node)
      : (node, index): node is Q extends Query<infer U> ? Node<U> : Node => index === queryIndex && matchQuery(node);

  // 💀 todo is should return Node<T>[] here
  return (node: Option<Node>): (Q extends Query<infer T> ? Node<T> : Node)[] => {
    // 💀 todo is should return Node<T>[] here
    const matches: (Q extends Query<infer T> ? Node<T> : Node)[] = [];
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

export function findFirst<Q extends Query<NodeType>>(
  q: Q
  // 💀 todo is should return Node<T> | undefined here
): (node: Node) => Option<Q extends Query<infer T> ? Node<T> : Node> {
  const { index: queryIndex, ...query } = q;
  const matchQuery = matches(query);
  const isMatchingNode: (node: Node, index: number) => node is Q extends Query<infer U> ? Node<U> : Node =
    queryIndex === undefined
      ? (node, _): node is Q extends Query<infer U> ? Node<U> : Node => matchQuery(node)
      : (node, index): node is Q extends Query<infer U> ? Node<U> : Node => index === queryIndex && matchQuery(node);

  // 💀 todo is should return Node<T> | undefined here
  return (node: Node): Option<Q extends Query<infer T> ? Node<T> : Node> => {
    for (const [child, , , index] of traverse(node)) {
      if (isMatchingNode(child, index)) {
        return child;
      }
    }
    return undefined;
  };
}
