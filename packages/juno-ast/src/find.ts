import { traverse } from "./traverse";
import { isNodeOfType } from "./types";
import type { Node, NodeType, NodeByType } from "./types";

export function findAllByType<T extends NodeType>(node: Node, type: T): NodeByType[T][] {
  const results: NodeByType[T][] = [];

  for (const [currentNode] of traverse(node)) {
    if (isNodeOfType(currentNode, type)) {
      results.push(currentNode);
    }
  }

  return results;
}
