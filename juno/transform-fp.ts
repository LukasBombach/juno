import { pipe, findFirst, findAll, parent, getReferences, get, is, has, first, flatten, replace } from "./pipeReboot";
import { parse } from "juno-ast/parse";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const func of findAll({ type: "FunctionExpression" })(module)) {
    const contextParam = pipe(
      func,
      findFirst({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      get("pat"),
      is("Identifier")
    );

    pipe(
      contextParam,
      getReferences(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" }),
      get("arguments"),
      first(),
      replace("ctx.ssrData[i]", (i) => ({ ctx: contextParam?.value, i }))
    );

    const eventHandlers = pipe(
      func,
      findAll({ type: "ReturnStatement" }),
      findAll({ type: "JSXAttribute", name: { value: /^on[A-Z]/ } }),
      flatten()
    );
  }

  return src;
}
