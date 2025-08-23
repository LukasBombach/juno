import { basename } from "node:path";
import { createHash } from "node:crypto";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/ReadonlyRecord";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import type { JSXElement } from "juno-ast";

export function transformJsxClient(input: string, id: string) {
  const { program } = oxc.parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "js" });

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
          const hydration = createHydration(jsxRoot, id);

          if (!parent) {
            console.warn("No parent found for JSX root in", id);
            return;
          }

          replaceChild(parent, hydration, jsxRoot);
        })
      );
    })
  );

  return print(program, tsx(), { indent: "  " });
}

function createHydration(jsxRoot: JSXElement, filename: string) {
  const hydration = pipe(
    jsxRoot,
    findAllByType("JSXElement"),
    A.filterMap(el => {
      const id = pipe(astId(filename, el.start), b.literal);

      const component = pipe(
        O.fromNullable(as.JSXIdentifier(el.openingElement.name)),
        O.map(identifier => identifier.name),
        O.filter(name => Boolean(name.match(/^[A-Z]/))),
        O.map(name => b.identName(name)),
        O.toUndefined
      );

      const attrs = pipe(
        el.openingElement,
        findAllByType("JSXAttribute"),
        A.filter(attr => {
          const name = as.JSXIdentifier(attr.name)?.name;
          return name === "ref" || Boolean(name?.match(/^on[A-Z]/));
        }),
        A.filterMap(attr => {
          const name = as.JSXIdentifier(attr.name)?.name;
          const value = pipe(
            attr,
            O.fromNullableK(findFirstByType("JSXExpressionContainer")),
            O.map(v => (is.JSXEmptyExpression(v.expression) ? b.identName("undefined") : v.expression)),
            O.toUndefined
          );
          return name && value ? O.some([name, value] as const) : O.none;
        }),
        A.match(() => undefined, R.fromEntries)
      );

      return component || attrs ? O.some(b.object({ id, component, ...attrs })) : O.none;
    })
  );

  return b.array(hydration);
}

function astId(filename: string, loc: number, length = 4): string {
  return createHash("md5").update(`${filename}${loc}`).digest("hex").substring(0, length);
}
