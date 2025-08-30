import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/ReadonlyRecord";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { highlight } from "cli-highlight";
import { pipe, is, as, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import { astId } from "./sharedTransform";
import type { JSXElement } from "juno-ast";

export function transformJsxClient(input: string, id: string) {
  const { program } = oxc.parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "js" });

  pipe(program, findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"), fn => {
    pipe(
      fn,
      A.map(fn => {
        const hasJsxReturn = pipe(
          fn,
          findAllByType("ReturnStatement"),
          A.some(returnStatement => {
            return pipe(returnStatement, findAllByType("JSXElement"), A.isNonEmpty);
          })
        );

        if (!hasJsxReturn) {
          return fn;
        }

        const componentId = astId(id, fn);
        // console.log(`client ${id.slice(-16)}:${fn.start}:${fn.end}`, componentId);

        const x = b.ExpressionStatement(
          b.AssignmentExpression(
            b.MemberExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), "_" + componentId),
            // @ts-expect-error wip
            b.ident(fn.id?.name)
          )
        );

        program.body.push(x);

        try {
          highlight(print(x, tsx()).code, { language: "tsx" });
        } catch (error) {
          console.error("Error highlighting code:", error);
          //console.dir(x, { depth: null });
          console.log(fn.type);
          console.log(highlight(print(fn, tsx()).code, { language: "tsx" }));
        }

        return fn;
      }),
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
  });

  return print(program, tsx(), { indent: "  " });
}

function createHydration(jsxRoot: JSXElement, filename: string) {
  const hydration = pipe(
    jsxRoot,
    findAllByType("JSXElement"),
    A.filterMap(el => {
      const id = pipe(astId(filename, el.openingElement), b.literal);

      const component = pipe(
        O.fromNullable(as.JSXIdentifier(el.openingElement.name)),
        O.map(identifier => identifier.name),
        O.filter(name => Boolean(name.match(/^[A-Z]/))),
        O.map(name => b.ident(name)),
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
            O.map(v => (is.JSXEmptyExpression(v.expression) ? b.ident("undefined") : v.expression)),
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
