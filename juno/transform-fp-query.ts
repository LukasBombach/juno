import { pipe } from "juno-ast/pipe";
import { parse } from "juno-ast/parse";
import { getReferences } from "juno-ast/refs";
import { findAll, findFirst, parent } from "juno-ast/query";

import type { Node } from "juno-ast/parse";
import type { Option } from "juno-ast/pipe";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  pipe(module)(module, findAll("type=FunctionExpression"), (fn, { pipe }) => {
    const signalCalls = pipe(
      fn,
      findFirst("type=Parameter.pat[0].type=Identifier"),
      getReferences(),
      parent("type=MemberExpression.property.type=Identifier&value=signal"),
      parent("type=CallExpression")
    );

    console.log(signalCalls);
  });

  return src;
}

function get<N extends Node, P extends keyof N>(name: P): (node: Option<N>) => Option<N[P]> {
  return (node) => node?.[name];
}
