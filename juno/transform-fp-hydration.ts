import { inspect } from "util";
import { parse, print } from "juno-ast/parse";
import { traverse } from "juno-ast/traverse";
import { pipe, findFirst, findAll, parent } from "./pipeReboot";
import { getProp } from "./pipeReboot";
import { is, flat, unique, map, fromEntries } from "./pipeReboot";
import { replace } from "./pipeReboot";
import { getParents, createParentMap } from "./pipeReboot";

import type { Node } from "juno-ast/parse";
import type * as t from "@swc/types";

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
 *   { path: [1,3]}, onClick: () => setCount(count + 1) },
 * ]
 */
function transform(returnStatement: Node<"ReturnStatement">): Node<"ReturnStatement"> {
  // get all identifiers used in event handlers
  const interactiveIds: t.Identifier[] = pipe(
    returnStatement,
    findAll({ type: "JSXAttribute" }),
    attrs => attrs.filter(attr => idToString(attr.name).match(/on[A-Z]/) !== null),
    findAll({ type: "Identifier" }),
    flat(),
  );

  // create a Regex that matches all their names
  // todo quick hack, also we need to escape special regex characters
  const interactiveIdsNames = interactiveIds.length
    ? new RegExp(`^${interactiveIds.map(id => id.value).join("|")}$`)
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
        map(attr => {
          const name = attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
          const expression = pipe(attr.value, is("JSXExpressionContainer"), getProp("expression"));
          return [name, expression];
        }),
      );

      return [["path", path], ...attrs] as (["path", number[]] | [string, t.JSXExpression])[];
    }),

    // allow attributes that are
    // the path
    // event handlers
    // include an identifier that is used in an event handler
  );
}

function getPath(el: t.JSXElement, allElements: t.JSXElement[]): number[] {
  return getParents(allElements[0])(el)
    .filter(parent => parent.type === "JSXElement")
    .concat(el)
    .map((cur, i, all) => (i === 0 ? 1 : all[i - 1].children.indexOf(cur) + 1));
}

function idToString(node: t.Identifier | t.JSXNamespacedName): string {
  return node.type === "Identifier" ? node.value : node.name.value;
}
