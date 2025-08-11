import { traverse, traverseWithControl } from "./traverse";
import { isNodeOfType } from "./guards";
import type { Node, NodeType, NodeOfType } from "./types";

export function findAllByType<T extends readonly [NodeType, ...NodeType[]]>(...types: T) {
  return (root: Node): NodeOfType<T[number]>[] => {
    const results: NodeOfType<T[number]>[] = [];

    for (const [node] of traverse(root)) {
      if (isNodeOfType(node, ...types)) {
        results.push(node);
      }
    }

    return results;
  };
}

export function findAllByTypeShallow<T extends readonly [NodeType, ...NodeType[]]>(...types: T) {
  return (root: Node): NodeOfType<T[number]>[] => {
    const results: NodeOfType<T[number]>[] = [];

    for (const { node, skipDescend } of traverseWithControl(root)) {
      if (isNodeOfType(node, ...types)) {
        results.push(node);
        skipDescend();
      }
    }

    return results;
  };
}

export function findFirstByType<T extends NodeType>(type: T) {
  return (root: Node): NodeOfType<T> | undefined => {
    for (const [node] of traverse(root)) {
      if (isNodeOfType(node, type)) {
        return node;
      }
    }
  };
}
