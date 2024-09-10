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

  for (const func of findAll({ type: "FunctionExpression" })(module)) {
    const contextParam = pipe(
      func,
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

    const eventHandlers = pipe(
      func,
      findAll({ type: "ReturnStatement" }),
      findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
      flat()
    );

    const keepJsxElements = pipe(
      eventHandlers,
      findAll({ type: "Identifier" }),
      flat(),
      getUsages(),
      flat(),
      parent({ type: "JSXElement" }),
      unique()
    );

    pipe(
      func,
      findAll({ type: "ReturnStatement" }),
      forEach(returnStatement => {
        const jsxElements = pipe(
          returnStatement,
          findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
          findAll({ type: "Identifier" }),
          flat(),
          getUsages(),
          flat(),
          parent({ type: "JSXElement" }),
          unique()
        );

        pipe(returnStatement, getProp("argument"), replace());
      })
    );
  }

  return src;
}
