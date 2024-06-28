import { parse, Api } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const ctxParam = fn.query("params[0].pat.type=Identifier");
    const usages =
      ctxParam
        ?.findUsages()
        .map(Api.toParent("MemberExpression"))
        .filter(exp => exp?.query("property.type=Identifier&value=signal")) ?? [];

    console.log(usages.length);
  }

  return src;
}
