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
 *   { path: [1,3], onClick: () => setCount(count + 1) },
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

  // reduce all JSXElements to a flat Array with they path and attributes
  const flatPathedElementList = pipe(
    returnStatement,
    findAll({ type: "JSXElement" }),
    map((el, _, allElements) => {
      const path = getPath(el, allElements);

      const attrs = pipe(
        el.opening.attributes,
        is("JSXAttribute"),
        map((attr) => {
          const name = attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
          const expression = pipe(attr.value, is("JSXExpressionContainer"), getProp("expression"));
          return [name, expression];
        })
      );

      return [["path", path], ...attrs] as (["path", number[]] | [string, t.JSXExpression])[];
    })
  );

  // allow attributes that are
  // the path
  // event handlers
  // include an identifier that is used in an event handler
  const remainingAttributes = flatPathedElementList
    .map((entries) => {
      return entries.filter(([name, expression]) => {
        if (name === "path") {
          return true;
        }

        if (name.match(/^on[A-Z]/)) {
          return true;
        }

        const identifiers = pipe(
          expression as t.JSXExpression,
          findAll({ type: "Identifier" }),
          map((id) => idToString(id))
        );

        const includesInteractiveId = identifiers.some((id) => interactiveIdsNames?.test(id));

        return includesInteractiveId;
      });
    })
    // todo dumbest hack assuming there's always a path
    // and if there are no attributes left, the length will be 1
    .filter((entries) => entries.length > 1);

  return {
    type: "ReturnStatement",
    span,
    argument: {
      type: "ArrayExpression",
      span,
      elements: remainingAttributes.map((attrs) => ({
        expression: {
          type: "ObjectExpression",
          span,
          properties: attrs.map(([name, expression]) => {
            if (name === "path") {
              return {
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
                  elements: (expression as number[]).map((num) => ({
                    expression: {
                      type: "NumericLiteral",
                      span,
                      value: num,
                      raw: num.toString(),
                    },
                  })),
                },
              };
            } else {
              return {
                type: "KeyValueProperty",
                key: {
                  type: "Identifier",
                  span,
                  value: name,
                  optional: false,
                },
                value: expression as t.JSXExpression,
              };
            }
          }),
        },
      })),
    },
  };
}

function getPath(el: t.JSXElement, allElements: t.JSXElement[]): number[] {
  return getParents(allElements[0])(el)
    .filter((parent) => parent.type === "JSXElement")
    .concat(el)
    .map((cur, i, all) => (i === 0 ? 1 : all[i - 1].children.indexOf(cur) + 1));
}

function idToString(node: t.Identifier | t.JSXNamespacedName): string {
  return node.type === "Identifier" ? node.value : node.name.value;
}
