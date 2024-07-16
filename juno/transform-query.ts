import { print } from "@swc/core";
import { parse, toParent, byQuery, nonNullable, toAst } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const contextParameter = fn.query("params[0].pat.type=Identifier");

    if (contextParameter) {
      const name = contextParameter.node.value;
      const refs = contextParameter.findReferences();

      const signalCalls = refs
        .map(toParent("MemberExpression"))
        .filter(byQuery("property.type=Identifier&value=signal"))
        .map(toParent("CallExpression"))
        .filter(nonNullable);

      for (const i in signalCalls) {
        signalCalls[i].node.arguments = [await toAst(`${name}.ssrData[${i}]`, "ExpressionStatement")];
      }

      await print(module.node).then((r) => {
        console.log(r.code);
      });
    }
  }

  return src;
}
