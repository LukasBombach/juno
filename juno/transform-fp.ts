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
  replace,
  forEach,
} from "./pipeReboot";
import { parse } from "juno-ast/parse";

import type { Node } from "juno-ast/parse";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  pipe(
    module,
    findAll({ type: "FunctionExpression" }),
    forEach(fn => {
      const contextParam = pipe(
        fn,
        findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
        getProp("pat"),
        is("Identifier")
      );

      pipe(
        contextParam,
        getReferences(),
        parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
        parent({ type: "CallExpression" }),
        getProp("arguments"),
        first(),
        replace("ctx.ssrData[i]", i => ({ ctx: contextParam?.value, i }))
      );

      pipe(
        fn,
        findAll({ type: "ReturnStatement" }),
        forEach(returnStatement => {
          pipe(
            returnStatement,
            getProp("argument"),
            replace(
              createReactiveInstructions(
                pipe(
                  returnStatement,
                  findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
                  findAll({ type: "Identifier" }),
                  flat(),
                  getUsages(),
                  flat(),
                  parent({ type: "JSXElement" }),
                  unique()
                )
              )
            )
          );
        })
      );
    })
  );

  return src;
}

function createReactiveInstructions(jsxElements: Node<"JSXElement">[]): string {}
