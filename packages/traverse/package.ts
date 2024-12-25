import { isNode } from "@juno/parse";

import type { Node } from "@juno/parse";

/**
 * @todo when a child is an object (but not a node), it should be traversed
 * @todo when a child is an array of objects (but not nodes), they should be traversed
 */
export function* traverse(current: Node): Generator<[node: Node, parent: Node, property: string, index: number]> {
  let parent = current;
  let property: keyof typeof parent;

  for (property in parent) {
    const child = parent[property];
    if (isNode(child)) {
      yield [child, parent, property, -1];
      yield* traverse(child);
    }
    if (Array.isArray(child)) {
      for (const i in child) {
        const nthChild = child[i];
        if (isNode(nthChild)) {
          yield [nthChild, parent, property, parseInt(i, 10)];
          yield* traverse(nthChild);
        }
      }
    }
  }
}
