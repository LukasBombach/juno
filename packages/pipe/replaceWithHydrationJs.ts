import { traverse } from "@juno/traverse";
import { getJSXElements } from "./getJSXElements";
import { filterInteractive } from "./filterInteractive";
import { pipe } from "./pipe";
import type { Node } from "@juno/parse";

export function replaceWithHydrationJs() {
  return (nodes: Node<"JSXElement">[]): void => {
    nodes.forEach((node) => {
      const x = pipe([node], getJSXElements(), filterInteractive());

      console.log(x.map((p) => (p[0].opening.name as Node<"Identifier">).value));
    });
  };
}
