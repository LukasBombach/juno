import { traverse } from "@juno/traverse";
import { pipe } from "./pipe";
import { flatMap, filter, unique } from "./array";

import type { Node, t } from "@juno/parse";

type InteractiveElement = {
  // marker: string;
  attrs: t.JSXAttribute[];
  events: t.JSXAttribute[];
  children: (number | t.Expression)[];
};

// @ts-expect-error swc is type wrongfully
const span: t.Span = { start: 0, end: 0 /* , ctxt: 0 */ };

export function replaceWithHydrationJs() {
  return (elements: [element: Node<"JSXElement">, parents: Node[]][]): void => {
    elements.forEach(([element, parents]) => {
      const parent = parents[0];

      const interactiveElements: InteractiveElement[] = [];

      const isInteractive = pipe(
        element,
        getJSXElements(),
        flatMap((el) => el.opening.attributes),
        filter((attr) => attr.type === "JSXAttribute"),
        filter((attr) => !!getName(attr)?.match(/^on[A-Z]/)),
        flatMap((attr) => getIdentifiers(attr)),
        unique(),
        toRegex()
      );

      for (const [node] of traverse(element)) {
        if (node.type === "JSXElement") {
          const interactiveAttrs = node.opening.attributes
            .filter((attr) => attr.type === "JSXAttribute")
            .filter((attr) => getIdentifiers(attr).some((id) => isInteractive.test(id.value)));

          const serializedChildren = node.children
            .filter((child) => {
              if (child.type === "JSXText") {
                return true;
              }
              if (child.type === "JSXExpressionContainer") {
                return getIdentifiers(child.expression).some((id) => isInteractive.test(id.value));
              }
              if (child.type === "JSXElement") {
                return false;
              }
              throw new Error(`Cannot handle JSX child type: ${child.type}`);
            })
            .map((child, i, all) => {
              if (child.type === "JSXText") {
                return i === 0
                  ? child.value.trimStart().length
                  : i === all.length - 1
                  ? child.value.trimEnd().length
                  : /^\s*(\r\n|\r|\n)\s*$/.test(child.value) // only whiltespace including min 1 newline, so 1+ newlines between jsx elements
                  ? 0
                  : child.value.length;
              }
              if (child.type === "JSXExpressionContainer") {
                return child.expression;
              }
              throw new Error(`Cannot handle JSX child type: ${child.type}`);
            })
            .filter((child, i, all) => {
              // filtering out static text nodes after the last expression
              // because they are not needed and we can might have children
              // arrays that are not interactive, just text nodes
              // @ts-expect-error ah, fuck off
              const lastExpression = all.findLastIndex((c) => typeof c !== "number");
              return typeof child !== "number" || i < lastExpression;
            });

          const interactiveChildren = serializedChildren.filter((child) => typeof child !== "number");

          if (interactiveAttrs.length || interactiveChildren.length) {
            // const { start } = node.span;
            // console.log("client marker", `juno${start}`);
            // const marker = `juno${start}`;

            interactiveElements.push({
              // marker,
              attrs: interactiveAttrs.filter((attr) => !getName(attr).match(/^on[A-Z]/)),
              events: interactiveAttrs.filter((attr) => getName(attr).match(/^on[A-Z]/)),
              children: serializedChildren,
            });
          }
        }
      }

      const hydrationArray = b.array(
        interactiveElements.map((el, i) => {
          const obj: Record<string, t.Expression> = {
            marker: b.string(`juno-${i}`),
          };

          if (el.attrs.length) {
            obj.attrs = b.object(
              Object.fromEntries(
                el.attrs.map((attr) => [getName(attr), (attr.value as t.JSXExpressionContainer).expression])
              )
            );
          }

          if (el.events.length) {
            obj.events = b.object(
              Object.fromEntries(
                el.events.map((attr) => [
                  getName(attr).replace(/^on/, "").toLowerCase(),
                  (attr.value as t.JSXExpressionContainer).expression,
                ])
              )
            );
          }

          if (el.children.length) {
            obj.children = b.array(
              el.children.map((child) => (typeof child === "number" ? b.number(child) : b.arrowFn(child)))
            );
          }

          return b.object(obj);
        })
      );

      switch (parent.type) {
        case "ParenthesisExpression":
          parent.expression = hydrationArray;
          break;
        case "ReturnStatement":
          parent.argument = hydrationArray;
          break;
        default:
          throw new Error(`Cannot handle parent type: ${parent.type}`);
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
    .filter((n) => n.type === "Identifier");
}

function toRegex(): (ids: t.Identifier[]) => RegExp {
  return (ids) => (ids.length ? new RegExp(`^(${ids.map((id) => id.value).join("|")})$`) : /never-match^/);
}

function getJSXElements() {
  return (node: Node): Node<"JSXElement">[] => {
    return Array.from(traverse(node))
      .map(([n]) => n)
      .filter((n): n is Node<"JSXElement"> => n.type === "JSXElement");
  };
}

const b = {
  array: (expressions: t.Expression[]): t.ArrayExpression => ({
    type: "ArrayExpression",
    elements: expressions.map((expression) => ({ expression })),
    span,
  }),
  object: (properties: Record<string, t.Expression>): t.ObjectExpression => ({
    type: "ObjectExpression",
    properties: Object.entries(properties).map(([key, value]) => ({
      type: "KeyValueProperty",
      key: b.ident(key),
      value,
      span,
    })),
    span,
  }),
  arrowFn: (body: t.Expression): t.ArrowFunctionExpression => ({
    type: "ArrowFunctionExpression",
    generator: false,
    async: false,
    params: [],
    // @ts-expect-error swc is type wrongfully
    ctxt: 0,
    body,
    span,
  }),
  ident: (value: string): t.Identifier => ({
    type: "Identifier",
    optional: false,
    value,
    span,
  }),
  string: (value: string): t.StringLiteral => ({
    type: "StringLiteral",
    raw: JSON.stringify(value),
    value,
    span,
  }),
  number: (value: number): t.NumericLiteral => ({
    type: "NumericLiteral",
    raw: JSON.stringify(value),
    value,
    span,
  }),
};
