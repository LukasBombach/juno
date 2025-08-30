import { isNode } from "./guards";
import type { Node } from "./types";

export function* traverse<T extends Node>(current: T, parents: Node[] = []): Generator<[node: Node, parents: Node[]]> {
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

type Visit = {
  node: Node;
  parents: Node[];
  /** call to prevent visiting this node's children */
  skipDescend: () => void;
};

export function* traverseWithControl(current: unknown, parents: Node[] = []): Generator<Visit> {
  if (isNode(current)) {
    let skipDescend = false;
    const visit: Visit = {
      node: current,
      parents,
      skipDescend: () => {
        skipDescend = true;
      },
    };
    yield visit;
    if (skipDescend) return;
  }

  const nextParents = isNode(current) ? [current as Node, ...parents] : parents;

  if (Array.isArray(current)) {
    for (const child of current) {
      yield* traverseWithControl(child, nextParents);
    }
  } else if (current && typeof current === "object") {
    for (const child of Object.values(current as Record<string, unknown>)) {
      yield* traverseWithControl(child, nextParents);
    }
  }
}
