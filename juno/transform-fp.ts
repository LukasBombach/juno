import { parse, print } from "juno-ast/parse";
import { traverse } from "juno-ast/traverse";
import { pipe, findFirst, findAll, parent } from "./pipeReboot";
import { getProp } from "./pipeReboot";
import { is, flat, unique } from "./pipeReboot";
import { replace } from "./pipeReboot";

import type { Node } from "juno-ast/parse";

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
        const identifierNames = pipe(
          returnStatement,
          findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
          getProp("value"),
          findAll({ type: "Identifier" }),
          flat(),
          unique(),
          identifiers => identifiers.map(id => id.value),
          values => values.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          values => (values.length ? new RegExp(`^(${values.join("|")})$`) : new RegExp("$cannot-match-anything")),
        );

        // console.log(
        //   pipe(
        //     returnStatement,
        //     findAll({ type: "Identifier", value: identifierNames }),
        //     parent(returnStatement, { type: "JSXAttribute" }),
        //     unique(),
        //   ),
        // );

        const jsxRoot = pipe(returnStatement, findFirst({ type: "JSXElement" }))!;

        const parents: Node<"JSXElement">[] = [jsxRoot];

        let currentPropertyName: string | undefined = undefined;

        const returnedElements: Record<string, Node<"JSXExpression">>[] = [];

        for (const [node, parent, property, index] of traverse(jsxRoot)) {
          if (node.type === "JSXElement") {
            parents.push(node);
          }
          if (node.type === "JSXAttribute") {
            currentPropertyName = node.name.type === "Identifier" ? node.name.value : node.name.name.value;
          }
          if (property === "children") {
            currentPropertyName = undefined;
          }
        }

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

/* function* traverseJsx(
  root: Node<"JSXElement">,
): Generator<[element: Node<"JSXElement">, parents: Node<"JSXElement">[]]>;
 */
