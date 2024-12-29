import { traverse } from "@juno/traverse";
import { pipe } from "./pipe";
import { flatMap, filter, unique } from "./array";

import type { Node, t } from "@juno/parse";

type InteractiveElement = {
  marker: string;
  attrs: t.JSXAttribute[];
  children: (number | t.Expression)[];
};

export function replaceWithHydrationJs() {
  return (elements: Node<"JSXElement">[]): void => {
    elements.forEach(element => {
      const interactiveElements: InteractiveElement[] = [];

      const isInteractive = pipe(
        element,
        getJSXElements(),
        flatMap(el => el.opening.attributes),
        filter(attr => attr.type === "JSXAttribute"),
        filter(attr => !!getName(attr)?.match(/^on[A-Z]/)),
        flatMap(attr => getIdentifiers(attr)),
        unique(),
        toRegex()
      );

      for (const [node] of traverse(element)) {
        if (node.type === "JSXElement") {
          const { start, end } = node.span;
          const marker = `juno-${start}-${end}`;

          const interactiveAttrs = node.opening.attributes
            .filter(attr => attr.type === "JSXAttribute")
            .filter(attr => getIdentifiers(attr).some(id => isInteractive.test(id.value)));

          const serializedChildren = node.children
            .filter(child => {
              if (child.type === "JSXText") {
                return true;
              }
              if (child.type === "JSXExpressionContainer") {
                return getIdentifiers(child.expression).some(id => isInteractive.test(id.value));
              }
              throw new Error(`Cannot handle JSX child type: ${child.type}`);
            })
            .map(child => {
              if (child.type === "JSXText") {
                return child.value.length;
              }
              if (child.type === "JSXExpressionContainer") {
                return child.expression;
              }
              throw new Error(`Cannot handle JSX child type: ${child.type}`);
            });

          const interactiveChildren = serializedChildren.filter(child => typeof child !== "number");

          if (interactiveAttrs.length || interactiveChildren.length) {
            interactiveElements.push({
              marker,
              attrs: interactiveAttrs,
              children: interactiveChildren,
            });
          }
        }
      }
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

function getJSXElements() {
  return (node: Node): Node<"JSXElement">[] => {
    return Array.from(traverse(node))
      .map(([n]) => n)
      .filter((n): n is Node<"JSXElement"> => n.type === "JSXElement");
  };
}
