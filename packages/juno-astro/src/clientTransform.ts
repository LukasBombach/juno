import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { builders as b, is } from "estree-toolkit";
import { pipe, findAllByType, findAllByTypeShallow } from "juno-ast";
import type { JSXElement, JSXExpressionContainer, Expression } from "juno-ast";

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
    A.findFirst(attr => is.jsxIdentifier(attr.name) && attr.name.name === "ref"),
    O.map(attr => attr.value),
    O.filter((v): v is JSXExpressionContainer => v?.type === "JSXExpressionContainer"),
    O.map(v => v.expression),
    O.filter(v => v.type !== "JSXEmptyExpression"),
    O.map(v => b.property("init", b.identifier("ref"), v as any)),
    O.toUndefined
  );

  return b.arrayExpression([
    b.objectExpression([b.property("init", b.identifier("path"), b.arrayExpression(path.map(b.literal)))]),
  ]);
}
