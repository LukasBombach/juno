import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { pipe, findAllByType, findAllByTypeShallow, is, as, build as b, findFirstByType } from "juno-ast";
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

function createHydration(jxElement: JSXElement) {
  const path = [1];

  const ref = pipe(
    jxElement.openingElement,
    findAllByType("JSXAttribute"),
    A.findFirst(attr => as.JSXIdentifier(attr.name)?.name === "ref"),
    O.chainNullableK(findFirstByType("JSXExpressionContainer")),
    O.map(v => (is.JSXEmptyExpression(v.expression) ? b.identName("undefined") : v.expression)),
    O.toUndefined
  );

  return b.array([b.object({ path: b.array(path.map(b.number)), ref })]);
}
