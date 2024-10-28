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

const span = {
  start: 0,
  end: 0,
  ctxt: 0,
};

function log(prefix: string) {
  return <T>(input: T): T => {
    console.log(prefix, input);
    return input;
  };
}

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });
  const functions = pipe(module, findAll({ type: "FunctionDeclaration" }));

  /**
   * Find all signal() initializations and replace their initial values with the SSR data
   * ctx.signal(xxx)   →   ctx.signal(ctx.ssrData[i])
   */
  functions.forEach(fn => {
    const ctxParam = pipe(fn, findFirst({ type: "Parameter", index: 0 }), getProp("pat"), is("Identifier"));

    if (!ctxParam) return;

    pipe(
      fn,
      findAll({ type: "Identifier", value: ctxParam.value }),
      parent(fn, { type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent(fn, { type: "CallExpression" }),
      calls => calls.map(call => call?.arguments[0].expression).filter(Boolean), // todo custom function - or not todo, it's actually cool I can do custom stuff here
      replace(fn, (_, i) => {
        return {
          type: "MemberExpression",
          span,
          object: {
            type: "MemberExpression",
            span,
            object: {
              type: "Identifier",
              span,
              value: ctxParam.value,
              optional: false,
            },
            property: {
              type: "Identifier",
              span,
              value: "ssrData",
              optional: false,
            },
          },
          property: {
            type: "Computed",
            span,
            expression: {
              type: "NumericLiteral",
              span,
              value: i,
            },
          },
        };
      }),
    );
  });

  /**
   * Find all return statements in the function and replace the returned JSX elements with an array
   * of extracted info that is relevant for hydration
   *
   * const template = `
   *   [
   *     { path: [1, 1], children: [count] },
   *     { path: [1, 2], onClick: () => count.set(count() + 1) },
   *   ]
   * `;
   *
   * return <div onClick={increment}>Count: {count}</div>   →   return [ { path: [1], onClick: increment, children: [7, count] } ]
   */

  functions.forEach(fn => {
    pipe(
      fn,
      findAll({ type: "ReturnStatement" }),
      replace(fn, returnStatement => {
        const flatPathedElementList = pipe(
          returnStatement,
          findAll({ type: "JSXElement" }),
          map((el, _, allElements) => {
            const path = getParents(allElements[0])(el)
              .filter(parent => parent.type === "JSXElement")
              .concat(el)
              .map((cur, i, all) => (i === 0 ? 1 : all[i - 1].children.indexOf(cur) + 1));

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
        );

        /* const attrsAndPaths = pipe(
          returnStatement,
          findAll({ type: "JSXElement" }),
          map((el, _, allElements) => {
            const path = getParents(allElements[0])(el)
              .filter(parent => parent.type === "JSXElement")
              .concat(el)
              .map((cur, i, all) => (i === 0 ? 1 : all[i - 1].children.indexOf(cur) + 1));

            const attrs = pipe(
              el.opening.attributes,
              is("JSXAttribute"),
              map(attr => {
                const name = attr.name.type === "Identifier" ? attr.name.value : attr.name.name.value;
                const identifiers = pipe(attr.value, findAll({ type: "Identifier" }));
                const expression = pipe(attr.value, is("JSXExpressionContainer"), getProp("expression"));
                return [name, identifiers] as [string, t.Identifier[]];
              }),
            );

            return [["path", path], ...attrs];
          }),
        ); */

        const allAttrs = flatPathedElementList
          .flat()
          .filter((entry): entry is [string, t.JSXExpression] => entry[0] !== "path");

        const identifiersWithinEventHandlers: t.Identifier[] = pipe(
          allAttrs.filter(([name]) => name.match(/^on[A-Z]/)),
          map(([_, expression]) => expression),
          findAll({ type: "Identifier" }),
          flat(),
          /* .filter(([name]) => (name as string).match(/^on[A-Z]/))
          .map(([_, identifiers]) => identifiers)
          .flat(); */
        );

        const identifiersRegex = new RegExp(identifiersWithinEventHandlers.map(id => id.value).join("|"), "g");

        const selectedProps = flatPathedElementList
          .map(entries => {
            return entries.filter(([name, identifiers]) => {
              if (name === "path") {
                return true;
              }

              if (name.match(/^on[A-Z]/)) {
                return true;
              }

              if ((identifiers as t.JSXExpression[]).some(id => id.value.match(identifiersRegex))) {
                return true;
              }

              return false;
            });
          })
          .filter(entries => entries.length > 1); // check check assuming there will always be a path

        console.log("");
        console.log("");
        console.log("attrsAndPaths");
        console.log("");
        console.log(inspect(selectedProps, { depth: null, colors: true }));

        return {
          type: "ReturnStatement",
          span,
          argument: {
            type: "ArrayExpression",
            span,
            elements: [],
          },
        };
      }),
    );
  });

  return await print(module);
}
