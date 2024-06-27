import { parse } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const contextParameter = fn.query("params.0.type=Identifier");

    console.log(contextParameter);
  }

  return src;
}
