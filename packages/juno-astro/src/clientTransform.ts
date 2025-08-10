import { basename } from "node:path";
import * as A from "fp-ts/Array";
import oxc from "oxc-parser";
import { builders as b } from "estree-toolkit";
import { pipe, findAllByType, findAllByTypeShallow } from "juno-ast";
import type { JSXElement } from "juno-ast";

export function transformJsx(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });

  console.log(id);

  pipe(
    program,
    findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"),
    A.flatMap(findAllByTypeShallow("JSXElement")),
    A.map(jsxReturnRoot => {
      console.log(jsxReturnRoot);
    })
  );

  return code;
}

function createHydration(jsxRoot: JSXElement) {
  return b.arrayExpression([]);
}
