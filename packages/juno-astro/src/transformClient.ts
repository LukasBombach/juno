import { basename } from "node:path";
import oxc from "oxc-parser";
import { pipe, findAllByType } from "juno-ast";

export function transformComponents(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });
  console.log(program);

  pipe(program, findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"), result => {
    console.log(result);
  });

  return code;
}
