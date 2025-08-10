import { basename } from "node:path";
import * as A from "fp-ts/Array";
import oxc from "oxc-parser";
import { pipe, findAllByType, findAllByTypeShallow } from "juno-ast";

export function transformComponents(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });

  pipe(
    program,
    findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"),
    A.flatMap(findAllByTypeShallow("JSXElement")),
    A.map(jsxReturnRoot => console.log(jsxReturnRoot))
  );

  return code;
}
