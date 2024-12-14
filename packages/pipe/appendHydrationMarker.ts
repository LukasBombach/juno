import type { Node } from "@juno/parse";

export function appendHydrationMarker() {
  return (nodes: Node<"JSXElement">[]): void => {
    throw new Error("Not implemented: appendHydrationMarker");
  };
}
