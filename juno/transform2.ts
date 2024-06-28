import { parse } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const ctxParam = fn.query("params.0.pat.type=Identifier");
    const usages = ctxParam?.findUsages() ?? [];

    console.log(usages.length);
  }

  return src;
}
