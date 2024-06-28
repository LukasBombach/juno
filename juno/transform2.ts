import { parse, toParent, byQuery } from "juno/ast";

export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const usages = fn
      .query("params[0].pat.type=Identifier")
      ?.findUsages()
      .map(toParent("MemberExpression"))
      .filter(byQuery("property.type=Identifier&value=signal"))
      .map(toParent("CallExpression"));

    console.log(usages?.map(usage => usage?.node));
  }

  return src;
}
