import { traverse } from "@juno/traverse";
import { pipe } from "./pipe";
import { flatMap, filter, unique } from "./array";

import type { Node, t } from "@juno/parse";

export function filterInteractive() {
  return (elements: Node<"JSXElement">[]): Node<"JSXElement">[] => {
    const isInteractive = pipe(
      elements,
      flatMap(el => el.opening.attributes),
      filter(attr => attr.type === "JSXAttribute"),
      filter(attr => !!getName(attr)?.match(/^on[A-Z]/)),
      flatMap(attr => getIdentifiers(attr)),
      unique(),
      toRegex()
    );

    return elements.filter(el => {
      return [...el.opening.attributes, ...el.children.filter(child => child.type === "JSXExpressionContainer")]
        .flatMap(attr => getIdentifiers(attr))
        .some(id => isInteractive.test(id.value));
    });
  };
}

function getName(attr: t.JSXAttribute): string {
  return attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
}

function getIdentifiers(current: Node): t.Identifier[] {
  return Array.from(traverse(current))
    .map(([n]) => n)
    .filter(n => n.type === "Identifier");
}

function toRegex(): (ids: t.Identifier[]) => RegExp {
  return ids => (ids.length ? new RegExp(`^(${ids.map(id => id.value).join("|")})$`) : /never-match^/);
}
