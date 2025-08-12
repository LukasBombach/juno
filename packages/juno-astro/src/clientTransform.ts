import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { pipe, is, as, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import type { JSXElement } from "juno-ast";

export function transformJsx(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });

  console.log(id);

  pipe(
    program,
    findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"),
    A.flatMap(findAllByTypeShallow("ReturnStatement")),
    A.map(returnStatement => {
      pipe(
        returnStatement,
        findAllByTypeShallow("JSXElement"),
        A.map(jsxRoot => {
          const parent = findParent(jsxRoot, returnStatement);
          const hydration = createHydration(jsxRoot);
          replaceChild(parent!, hydration, jsxRoot);
        })
      );
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
