import {
  pipe,
  findFirst,
  findAll,
  parent,
  getReferences,
  getUsages,
  getProp,
  is,
  first,
  unique,
  flat,
  map,
  forEach,
  replace,
} from "./pipeReboot";
import { parse } from "juno-ast/parse";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  pipe(
    module,
    findAll({ type: "FunctionExpression" }),
    forEach((fn) => {
      /**
       * replace all `ctx.signal(xxx)` with `ctx.signal(ctx.ssrData[i])`
       */
      pipe(
        fn,
        findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
        getProp("pat"),
        is("Identifier"),
        replace((ctxParam) =>
          pipe(
            ctxParam,
            getReferences(),
            parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
            parent({ type: "CallExpression" }),
            getProp("arguments"),
            first(),
            map((_, i) => `${ctxParam?.value}.ssrData[${i}]`)
          )
        )
      );

      /**
       * find all return statements and replace the argument with reactive instructions
       */
      pipe(
        fn,
        findAll({ type: "ReturnStatement" }),
        replace((returnStatement) =>
          pipe(
            returnStatement,
            findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
            findAll({ type: "Identifier" }),
            flat(),
            getUsages(),
            flat(),
            parent({ type: "JSXElement" }),
            unique(),
            getProp("opening"),
            map((opening) => {
              const template = `
                [
                  { path: [1, 1], children: [count] },
                  { path: [1, 2], onClick: () => count.set(count() + 1) },
                ]
              `;
              return "";
            })
          )
        )
      );
    })
  );

  return src;
}
