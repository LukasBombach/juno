import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { parse, toParent, byQuery, Api } from "juno/ast";
import type * as t from "@swc/types";



export async function transformToClientCode2(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const contextParameter = O.fromNullable(fn.query("params[0].pat.type=Identifier"));
    const signalCalls = pipe(contextParameter, O.map((ctxParam) => { 

    });
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
