import { parse } from "juno-ast/parse";
import { pipe, first, findFirst, findAll, parent } from "./pipeReboot";
import { getReferences, getUsages, getProp } from "./pipeReboot";
import { is, flat } from "./pipeReboot";
import { forEach, replace } from "./pipeReboot";

/**
 * const template = `
 *   [
 *     { path: [1, 1], children: [count] },
 *     { path: [1, 2], onClick: () => count.set(count() + 1) },
 *   ]
 * `;
 */

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });
  const functions = pipe(module, findAll({ type: "FunctionExpression" }));

  /**
   * Find all signal() initializations and replace their initial values with the SSR data
   * ctx.signal(xxx)   →   ctx.signal(ctx.ssrData[i])
   */
  pipe(
    functions,
    forEach((fn) => {
      pipe(
        fn,
        findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
        getProp("pat"),
        is("Identifier"),
        forEach((ctx) =>
          pipe(
            ctx,
            getReferences(),
            parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
            parent({ type: "CallExpression" }),
            getProp("arguments"),
            first(),
            replace((_, i) => `${ctx?.value}.ssrData[${i}]`)
          )
        )
      );
    })
  );

  /**
   * Find all return statements in the function and replace the returned JSX elements with an array
   * of extracted info that is relevant for hydration
   * return <div onClick={increment}>Count: {count}</div>   →   return [ { path: [1], onClick: increment, children: [7, count] } ]
   */
  pipe(
    functions,
    forEach((fn) => {
      pipe(
        fn,
        findAll({ type: "ReturnStatement" }),
        replace((returnStatement) => {
          pipe(
            returnStatement,
            findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
            findAll({ type: "Identifier" }),
            flat(),
            getUsages(),
            flat()
          );
          return "";
        })
      );
    })
  );

  return src;
}
