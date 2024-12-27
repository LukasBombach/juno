import { traverse } from "@juno/traverse";
import type { Node } from "@juno/parse";

export function replaceWithHydrationJs() {
  return (nodes: Node<"JSXElement">[]): void => {
    console.log(nodes.length);
  };
}
