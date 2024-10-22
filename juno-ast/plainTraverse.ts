import { isNode } from "juno-ast/parse";
import type { Node } from "juno-ast/parse";

/**
 * very hard todo: if the child is an object but not a node, it will not be traversed
 */
export function* traverse(
  current: Node,
  parents: Node[] = [],
): Generator<[node: Node, parents: Node[], property: string, index: number]> {
  let parent = current;
  let property: keyof typeof parent;

  // parents will get passed down the recursion stack
  // so we always have the full path to the current node
  // we clone the parents array to avoid mutating it
  parents = [...parents, parent];

  for (property in parent) {
    const child = parent[property];

    if (typeof child === "object" || child !== null) {
      yield [child, parents, property, -1];
      yield* traverse(child, parents);
    }

    if (Array.isArray(child)) {
      for (const i in child) {
        const nthChild = child[i];
        if (isNode(nthChild)) {
          yield [nthChild, parents, property, parseInt(i, 10)];
          yield* traverse(nthChild, parents);
        }
      }
    }
  }
}
