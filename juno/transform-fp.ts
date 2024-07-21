import { pipe } from "juno-ast/pipe";
import { parse } from "juno-ast/parse";
import { findFirst, findAll, parent } from "juno-ast/find2";
import { getReferences } from "juno-ast/refs2";
import { get } from "juno-ast/get";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  pipe(module)(module, findAll({ type: "FunctionExpression" }), (fn, { pipe }) => {
    const signalCalls = pipe(
      fn,
      findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      get("pat"),
      getReferences(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" }),
      get("arguments")
      // replace("arguments", "$CTX.ssrData[$I]")
    );

    console.log(signalCalls);
  });

  return src;
}
