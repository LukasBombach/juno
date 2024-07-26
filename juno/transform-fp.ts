import { pipe, findFirst, findAll, parent, getReferences, get, first, replace } from "./pipeReboot";
import { parse } from "juno-ast/parse";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const func of findAll({ type: "FunctionExpression" })(module)) {
    const contextParam = pipe(
      func,
      findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      get("pat")
    );

    const initialSignalValues = pipe(
      contextParam,
      getReferences(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" }),
      get("arguments"),
      first()
    );

    for (const i in initialSignalValues) {
      replace()(initialSignalValues[i]);
    }
  }

  return src;
}
