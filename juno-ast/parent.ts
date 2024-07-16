import { pipe } from "juno-ast/pipe";
import { parse } from "juno-ast/parse";
import { getReferences } from "juno-ast/refs";
import { findFirst, findAll } from "juno-ast/find";
import { matches } from "lodash";

import type { Node, NodeType } from "juno-ast/parse";
import type { PipeApi, Option } from "juno-ast/pipe";
import type { Query } from "juno-ast/query";

export function parent<Q extends Query<NodeType>>(
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
