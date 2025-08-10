import { traverse } from "./traverse";
import { isNodeOfType } from "./types";
import type { Node, NodeType, NodeByType } from "./types";

type NodesByType<K extends NodeType> = Extract<Node, { type: K }>;

/* type NodeOf<T extends NodeType | readonly NodeType[]> = T extends readonly NodeType[]
  ? NodeByType[T[number]]
  : T extends NodeType
  ? NodeByType[T]
  : never;

type x = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"][number];
type y = NodeByType[NodeType[][number]];

export function findAllByType<T extends readonly NodeType[]>(type: T): (node: Node) => NodeByType[T[number]][];
export function findAllByType<T extends NodeType>(type: T): (node: Node) => NodeByType[T];
export function findAllByType<T extends NodeType | readonly NodeType[]>(
  type: T
): (node: Node) => any  {
  return node => {
    const results: Array<NodeOf<T>> = [];
    const types = Array.isArray(type) ? type : [type];

    for (const [currentNode] of traverse(node)) {
      if (isNodeOfType(currentNode, types)) {
        results.push(currentNode);
      }
    }

    return results;
  };
} */

type x = NodesByType<
  "FunctionDeclaration" | "FunctionExpression" | "TSDeclareFunction" | "TSEmptyBodyFunctionExpression"
>;

export function findAllByType<A extends NodeType, B extends NodeType, C extends NodeType>(
  a: A,
  b: B,
  c: C
): (node: Node) => NodeByType[A | B | C][];
export function findAllByType<A extends NodeType, B extends NodeType>(a: A, b: B): (node: Node) => NodeByType[A | B][];
export function findAllByType<A extends NodeType>(a: A): (node: Node) => NodeByType[A][];
export function findAllByType<A extends NodeType, B extends NodeType | undefined, C extends NodeType | undefined>(
  a: A,
  b: B,
  c: C
): (node: Node) => NodeByType[A | B | C][] {
  return node => {
    const results: Array<NodeByType[A | B | C]> = [];
    const types = [a, b, c];

    for (const [currentNode] of traverse(node)) {
      if (isNodeOfType(currentNode, types)) {
        results.push(currentNode);
      }
    }

    return results;
  };
}
