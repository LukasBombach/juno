import { pipe } from "./pipe";

import type { Node, t } from "@juno/parse";

export function filterInteractive() {
  return (elements: Node<"JSXElement">[]): Node<"JSXElement">[] => {
    return filterInteractiveJsxBySimpleIdentifierStrategy(elements);
    // const eventHandlers = elements.flatMap(getAttributes).filter(isNotSpread).filter(isEventHandler);
    // const identifiers = eventHandlers.flatMap(getIdentifiers).filter;
  };
}

function filterInteractiveJsxBySimpleIdentifierStrategy(elements: Node<"JSXElement">[]): Node<"JSXElement">[] {
  const x = pipe(
    elements,
    flatMap(el => el.opening.attributes),
    filter(attr => attr.type === "JSXAttribute"),
    filter(attr => Boolean(attr.name.value.match(/^on[A-Z]/)))
  );
}

function map<T, R>(fn: (value: T) => R): (arr: T[]) => R[] {
  return arr => arr.map(fn);
}

function flatMap<T, R>(fn: (value: T) => R[]): (arr: T[]) => R[] {
  return arr => arr.flatMap(fn);
}

function filter<T>(fn: (value: T) => boolean): (arr: T[]) => T[];
function filter<T, S extends T>(fn: (value: T) => value is S): (arr: T[]) => S[];
function filter<T>(fn: (value: T) => boolean): (arr: T[]) => T[] {
  return arr => arr.filter(fn);
}

function getAttributes(element: t.JSXElement): t.JSXAttributeOrSpread[] {
  return element.opening.attributes;
}

function isNotSpread(attr: t.JSXAttributeOrSpread): attr is t.JSXAttribute {
  return attr.type === "JSXAttribute";
}

function isEventHandler(attr: t.JSXAttribute): boolean {
  return Boolean(getName(attr)?.match(/^on[A-Z]/));
}

function getName(attr: t.JSXAttribute): string {
  return attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
}

function getIdentifiers(node: Node): t.Identifier[] {
  throw new Error("Not implemented: getIdentifiers");
}

function unique<T>(): T[] {}
