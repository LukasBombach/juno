import { traverse } from "./traverse";
import { isNodeOfType } from "./types";
import type { Node, NodeType, NodeByType } from "./types";

export function findAllByType<A extends NodeType>(a: A): (node: Node) => NodeByType<A>[];
export function findAllByType<A extends NodeType, B extends NodeType>(a: A, b: B): (node: Node) => NodeByType<A | B>[];
export function findAllByType<A extends NodeType, B extends NodeType, C extends NodeType>(
  a: A,
  b: B,
  c: C
): (node: Node) => NodeByType<A | B | C>[];
export function findAllByType<A extends NodeType, B extends NodeType, C extends NodeType, D extends NodeType>(
  a: A,
  b: B,
  c: C,
  d: D
): (node: Node) => NodeByType<A | B | C | D>[];
export function findAllByType<
  A extends NodeType,
  B extends NodeType,
  C extends NodeType,
  D extends NodeType,
  E extends NodeType
>(a: A, b: B, c: C, d: D, e: E): (node: Node) => NodeByType<A | B | C | D | E>[];
export function findAllByType<
  A extends NodeType,
  B extends NodeType,
  C extends NodeType,
  D extends NodeType,
  E extends NodeType,
  F extends NodeType
>(a: A, b: B, c: C, d: D, e: E, f: F): (node: Node) => NodeByType<A | B | C | D | E | F>[];
export function findAllByType<
  A extends NodeType,
  B extends NodeType,
  C extends NodeType,
  D extends NodeType,
  E extends NodeType,
  F extends NodeType,
  G extends NodeType
>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): (node: Node) => NodeByType<A | B | C | D | E | F | G>[];
export function findAllByType<
  A extends NodeType,
  B extends NodeType,
  C extends NodeType,
  D extends NodeType,
  E extends NodeType,
  F extends NodeType,
  G extends NodeType
>(a: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G): (node: Node) => NodeByType<A | B | C | D | E | F | G>[] {
  return node => {
    const results: NodeByType<A | B | C | D | E | F | G>[] = [];

    for (const [currentNode] of traverse(node)) {
      if (isNodeOfType(currentNode, a, b, c, d, e, f, g)) {
        results.push(currentNode);
      }
    }

    return results;
  };
}
