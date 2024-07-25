import { pipe, findFirst, findAll, parent, getReferences, get, first, replace } from "./pipeReboot";
import { parse } from "juno-ast/parse";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  const signalCalls = pipe(module, findAll({ type: "FunctionExpression" }), (funcs, { pipe }) =>
    funcs.map((func) =>
      pipe(
        func,
        findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
        get("pat"),
        getReferences(),
        parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
        parent({ type: "CallExpression" }),
        get("arguments"),
        first(),
        replace("ctx.ssrValues[i]", ({ ctx }, i) => ({ ctx: "ctx", i }))
      )
    )
  );

  console.log(signalCalls);

  return src;
}
