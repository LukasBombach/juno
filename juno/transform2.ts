import { parse } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const ctxParam = fn.query("params.0.pat.type=Identifier");
    const usages = [...fn.find("Identifier")].filter(
      id => id.node !== ctxParam?.node && id.node.value === ctxParam?.node.value
    );

    console.log(usages.length);
  }

  return src;
}
