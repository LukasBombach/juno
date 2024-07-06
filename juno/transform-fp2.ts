import { pipe } from "fp-ts/function";
import { parse } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const signalCalls = pipe(
      fn,
      get("params[0].pat.type=Identifier"),
      parent("MemberExpression"),
      filter("property.type=Identifier&value=signal"),
      parent("CallExpression"),
      filter(nonNullable)
    );

    const signalCalls2 = pipe(
      fn,
      functionParams(0),
      filter({ type: "Identifier" }),
      references(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" })
    );

    const signalCalls3 = pipe(
      fn,
      contextParameter(),
      references(),
      parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      parent({ type: "CallExpression" })
    );

    const signalCalls4 = pipe(
      fn,
      contextParameter(),
      references(),
      parent(MemberExpression({ property: Identifier("signal") })),
      parent(CallExpression)
    );
  }

  return src;
}
