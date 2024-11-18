import { pipe, findAll } from "./pipe";
import { getProp } from "./pipe";
import { is, flat, map } from "./pipe";
import { getParents } from "./pipe";

import type { Node } from "./parse";
import type * as t from "@swc/types";

const span = {
  start: 0,
  end: 0,
  ctxt: 0,
};

/**
 * transforms
 *
 * ```
 * return (
 *   <main>
 *     <h1>Hello World</h1>
 *     <pre>{count}</pre>
 *     <button onClick={() => setCount(count + 1)}>Increment</button>
 *   <main>
 * )
 * ```
 *
 * to
 *
 * ```
 * return [
 *   { path: [1,2], children: [count] },
 *   { path: [1,3], events: { click: () => setCount(count + 1) } },
 * ]
 */
export function transformHydrations(returnStatement: Node<"ReturnStatement">): Node<"ReturnStatement"> {
  // get all identifiers used in event handlers
  const interactiveIds: t.Identifier[] = pipe(
    returnStatement,
    findAll({ type: "JSXAttribute" }),
    (attrs) => attrs.filter((attr) => idToString(attr.name).match(/on[A-Z]/) !== null),
    findAll({ type: "Identifier" }),
    flat()
  );

  // create a Regex that matches all their names
  // todo quick hack, also we need to escape special regex characters
  const interactiveIdsNames = interactiveIds.length
    ? new RegExp(`^${interactiveIds.map((id) => id.value).join("|")}$`)
    : null;

  const clientAttributes = pipe(
    returnStatement,
    findAll({ type: "JSXElement" }),
    map((el, _, allElements) => {
      const path = getPath(el, allElements);

      const props = pipe(
        el.opening.attributes,
        is("JSXAttribute"),
        map((attr) => {
          const name = attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
          const expression: t.Expression = pipe(attr.value, is("JSXExpressionContainer"), getProp("expression"));
          return [name, expression];
        })
      ) as [string, t.Expression][];

      const attrs = props.filter(([name]) => !name.match(/^on[A-Z]/));
      const events = props
        .filter(([name]) => name.match(/^on[A-Z]/))
        .map(([name, expression]) => [name.substring(2).toLowerCase(), expression] as [string, t.Expression]);

      const children = pipe(el.children, is("JSXExpressionContainer"), getProp("expression"));

      const extractedClientCode2: {
        path: number[];
        attrs: Record<string, t.Expression>;
        events: Record<string, t.Expression>;
        children: t.Expression[];
      } = { path, attrs: Object.fromEntries(attrs), events: Object.fromEntries(events), children };

      return extractedClientCode2;
    })
  )
    .map(({ path, attrs, events, children }) => {
      return {
        path,
        events,
        children,
        attrs: Object.fromEntries(
          Object.entries(attrs).filter(([name, expression]) => {
            const identifiers = pipe(
              expression,
              findAll({ type: "Identifier" }),
              map((id) => idToString(id))
            );

            const includesInteractiveId = identifiers.some((id) => interactiveIdsNames?.test(id));

            return includesInteractiveId;
          })
        ),
      };
    })
    .filter(
      (elm) =>
        Object.keys(elm.events).length > 0 || Object.keys(elm.attrs).length > 0 || Object.keys(elm.children).length > 0
    );

  return {
    type: "ReturnStatement",
    span,
    argument: {
      type: "ArrayExpression",
      span,
      elements: clientAttributes.map(({ path, attrs, events, children }) => ({
        expression: {
          type: "ObjectExpression",
          span,
          properties: [
            {
              type: "KeyValueProperty",
              key: {
                type: "Identifier",
                span,
                value: "path",
                optional: false,
              },
              value: {
                type: "ArrayExpression",
                span,
                elements: path.map((num) => ({
                  expression: {
                    type: "NumericLiteral",
                    span,
                    value: num,
                    raw: String(num),
                  },
                })),
              },
            },
            {
              type: "KeyValueProperty",
              key: {
                type: "Identifier",
                span,
                value: "attrs",
                optional: false,
              },
              value: {
                type: "ObjectExpression",
                span,
                properties: Object.entries(attrs).map(([name, expression]) => ({
                  type: "KeyValueProperty",
                  key: {
                    type: "Identifier",
                    span,
                    value: name,
                    optional: false,
                  },
                  value: expression,
                })),
              },
            },
            {
              type: "KeyValueProperty",
              key: {
                type: "Identifier",
                span,
                value: "events",
                optional: false,
              },
              value: {
                type: "ObjectExpression",
                span,
                properties: Object.entries(events).map(([name, expression]) => ({
                  type: "KeyValueProperty",
                  key: {
                    type: "Identifier",
                    span,
                    value: name,
                    optional: false,
                  },
                  value: expression,
                })),
              },
            },
            {
              type: "KeyValueProperty",
              key: {
                type: "Identifier",
                span,
                value: "children",
                optional: false,
              },
              value: {
                type: "ArrayExpression",
                span,
                elements: children.map((child) => ({
                  expression: {
                    type: "ArrowFunctionExpression",
                    span,
                    ctxt: 0,
                    params: [],
                    body: child,
                    async: false,
                    generator: false,
                  },
                })),
              },
            },
          ],
        },
      })),
    },
  };
}

function getPath(el: t.JSXElement, allElements: t.JSXElement[]): number[] {
  return getParents(allElements[0])(el)
    .filter((parent) => parent.type === "JSXElement")
    .slice()
    .reverse()
    .concat(el)
    .map((cur, i, all) =>
      i === 0 ? 1 : all[i - 1].children.filter((el) => el.type === "JSXElement").indexOf(cur) + 1
    );
}

function idToString(node: t.Identifier | t.JSXNamespacedName): string {
  return node.type === "Identifier" ? node.value : node.name.value;
}
