import { pipe } from "./pipe";
import { flatMap, filter } from "./array";

import type { Node, t } from "@juno/parse";

export function filterInteractive() {
  return (elements: Node<"JSXElement">[]): Node<"JSXElement">[] => {
    return filterInteractiveJsxBySimpleIdentifierStrategy(elements);
  };
}

function filterInteractiveJsxBySimpleIdentifierStrategy(elements: Node<"JSXElement">[]): Node<"JSXElement">[] {
  const x = pipe(
    elements,
    flatMap(el => el.opening.attributes),
    filter(attr => attr.type === "JSXAttribute"),
    filter(attr => !!getName(attr)?.match(/^on[A-Z]/)),
    flatMap(attr => getIdentifiers(attr))
  );

  throw new Error("Not implemented: filterInteractiveJsxBySimpleIdentifierStrategy");
}

function getName(attr: t.JSXAttribute): string {
  return attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
}

function getIdentifiers(node: Node): t.Identifier[] {
  throw new Error("Not implemented: getIdentifiers");
}
