import { basename } from "node:path";
import oxc from "oxc-parser";
import { pipe, findAllByType, functionTypes } from "juno-ast";

export function transformComponents(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });
  console.log(program);

  const results = pipe(
    program,
    findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression")
    // Add your transformation functions here
  );

  return code;
}
