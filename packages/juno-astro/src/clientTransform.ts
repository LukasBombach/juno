import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { pipe, findAllByType, findAllByTypeShallow, is, not, build as b } from "juno-ast";
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
    A.findFirst(attr => is.jsxIdentifier(attr.name) && attr.name.name === "ref"),
    O.map(attr => attr.value),
    O.filter(is.JSXExpressionContainer),
    O.map(v => v.expression),
    O.filter(not.JSXEmptyExpression),
    O.map(v => b.prop("ref", v)),
    O.toUndefined
  );

  return b.array([b.object({ path: b.array(path.map(b.number)) })]);
}
