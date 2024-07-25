import { pipe, findFirst, findAll } from "./pipeReboot";
import { parse } from "juno-ast/parse";
// import { findFirst, findAll, parent } from "juno-ast/find2";
// import { getReferences } from "juno-ast/refs2";
// import { get, get2 } from "juno-ast/get";
import type { PipeApi } from "juno-ast/pipe";
import type { Node } from "juno-ast/parse";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  const signalCalls = pipe(
    module,
    findAll({ type: "FunctionExpression" }),
    findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } })
  );

  // findAll({ type: "FunctionExpression" })
  // findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } })
  //get("pat"),
  //getReferences(),
  //parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
  //parent({ type: "CallExpression" }),
  //get("arguments")
  // replace("arguments", "$CTX.ssrData[$I]")

  console.log(signalCalls);

  return src;
}
