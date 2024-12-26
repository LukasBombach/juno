import type { Node } from "@juno/parse";

export function appendHydrationMarker() {
  return (nodes: Node<"JSXElement">[]): void => {
    console.log(
      "appendHydrationMarker\n",
      nodes.map(node => `${(node.opening.name as any).value} at ${node.span.start}:${node.span.end}`).join("\n ")
    );
  };
}
