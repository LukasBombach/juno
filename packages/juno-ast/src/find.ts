import { traverse } from "./traverse";
import { isNodeOfType } from "./types";
import type { Node, NodeType, NodeByType } from "./types";

export function findAllByType<T extends readonly [NodeType, ...NodeType[]]>(...types: T) {
  return (root: Node): NodeByType<T[number]>[] => {
    const results: NodeByType<T[number]>[] = [];

    for (const [node] of traverse(root)) {
      if (isNodeOfType(node, ...types)) {
        results.push(node);
      }
    }

    return results;
  };
}
