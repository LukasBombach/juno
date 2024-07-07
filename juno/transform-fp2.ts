import { pipe } from "fp-ts/function";
import { parse } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const signalCalls = pipe(
      fn,
      children({ type: "Parameter", index: 0, pat: { type: "Identifier" } }),
      references(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" })
    );
  }

  return src;
}
