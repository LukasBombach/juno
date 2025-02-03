import { traverse } from "@juno/traverse";
import { getJSXElements } from "./getJSXElements";
import { pipe } from "./pipe";
import { flatMap, filter, unique, map } from "./array";

import type { Node, t } from "@juno/parse";

export function interactiveIdentifiers() {
  return (fn: Node<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">): t.Identifier[] => {
    return pipe(
      [fn],
      getJSXElements(),
      map(([el]) => el),
      flatMap(el => el.opening.attributes),
      filter(attr => attr.type === "JSXAttribute"),
      filter(attr => !!getName(attr)?.match(/^on[A-Z]/)),
      flatMap(attr => getIdentifiers(attr)),
      unique()
    );
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
