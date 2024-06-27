import { parse } from "juno/ast";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src);

  for (const fn of module.find("FunctionExpression")) {
    const contextParameter = fn.query("params.0.type=Identifier");
  }
}
