import { isNode } from "@juno/parse";

import type { Node } from "@juno/parse";

export function* traverse(current: unknown, parents: Node[] = []): Generator<[node: Node, parents: Node[]]> {
  if (isNode(current)) {
    yield [current, parents];
  }

  const nextParents = isNode(current) ? [current, ...parents] : [...parents];

  if (Array.isArray(current)) {
    for (const child of current) {
      yield* traverse(child, nextParents);
    }
  }

  if (!Array.isArray(current) && typeof current === "object" && current !== null) {
    for (const child of Object.values(current)) {
      yield* traverse(child, nextParents);
    }
  }
}
