import { parse, print } from "@juno/parse";
import { pipe, findFirst, findAll, parent } from "./pipe";
import { getProp } from "./pipe";
import { is } from "./pipe";
import { replace } from "./pipe";
import { transformHydrations } from "./transform-fp-hydration";

const span = {
  start: 0,
  end: 0,
  ctxt: 0,
};

export async function transform(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });
  const functions = [
    ...pipe(module, findAll({ type: "FunctionDeclaration" })),
    ...pipe(module, findAll({ type: "FunctionExpression" })),
  ];

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
              ctxt: 0,
              value: ctxParam.value,
              optional: false,
            },
            property: {
              type: "Identifier",
              span,
              ctxt: 0,
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
      })
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
        return transformHydrations(returnStatement);
      })
    );
  });

  return await print(module);
}
