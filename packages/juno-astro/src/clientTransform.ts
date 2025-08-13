import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { highlight } from "cli-highlight";
import { pipe, is, as, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeWithParents, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import type { JSXElement } from "juno-ast";

export function transformJsx(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });

  console.log("\n" + id + "\n");

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

  console.log(highlight(print(program, tsx()).code, { language: "tsx" }));

  return code;
}

function createHydration(jsxRoot: JSXElement) {
  const path = [1];

  const hydration = pipe(
    jsxRoot,
    findAllByTypeWithParents("JSXElement"),
    A.map(([el, parents]) => [el, pipe(parents, A.filter(is.JSXElement), A.append(el))] as const),
    A.map(([el, jsxParents]) => {
      const path = pipe(
        jsxParents,
        A.mapWithIndex((i, el) => {
          if (i === 0) return 0;
          const directParent = jsxParents[i - 1];
          return pipe(directParent.children, A.filter(is.JSXElement), jsxChildren => jsxChildren.indexOf(el));
        })
      );

      console.log(jsxParents.map(el => as.JSXIdentifier(el.openingElement.name)?.name).join(" > "), path);

      return path;
    })
  );

  const ref = pipe(
    jsxRoot.openingElement,
    findAllByType("JSXAttribute"),
    A.findFirst(attr => as.JSXIdentifier(attr.name)?.name === "ref"),
    O.chainNullableK(findFirstByType("JSXExpressionContainer")),
    O.map(v => (is.JSXEmptyExpression(v.expression) ? b.identName("undefined") : v.expression)),
    O.toUndefined
  );

  return b.array([b.object({ path: b.array(path.map(b.number)), ref })]);
}
