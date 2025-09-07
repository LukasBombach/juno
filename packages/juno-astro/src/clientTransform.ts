import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/ReadonlyRecord";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, not, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import { traverseWithControl, isNodeOfType } from "juno-ast";
import { astId, findComponents, printHighlighted } from "./sharedTransform";
import type { JSXElement, Expression } from "juno-ast";

export function transformJsxClient(input: string, id: string) {
  const { program } = oxc.parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "ts" });

  pipe(program, findComponents, fn => {
    pipe(
      fn,
      A.map(fn => {
        const componentId = astId(id, fn);

        const x = b.ExpressionStatement(
          b.AssignmentExpression(
            b.MemberExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), componentId),
            // @ts-expect-error wip
            b.ident(fn.id?.name)
          )
        );

        program.body.push(x);

        // try {
        //   highlight(print(x, tsx()).code, { language: "tsx" });
        // } catch (error) {
        //   console.error("Error highlighting code:", error);
        //   //console.dir(x, { depth: null });
        //   console.log(fn.type);
        //   console.log(highlight(print(fn, tsx()).code, { language: "tsx" }));
        // }

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

function createHydration2(el: JSXElement, filename: string) {
  // for each jsx element
  // create an entry
  //  if it's a component (uppercase first letter) add component: Component
  //  if it has has reactive atts (ref, onX) add hidration attrs
  //  if it has children that are expressions, recurse and add their hydration data as well
  // return an array of these entries
  const hydrations: Expression[] = [];

  const id = pipe(astId(filename, el.openingElement), b.literal);

  const name = pipe(
    O.fromNullable(as.JSXIdentifier(el.openingElement.name)),
    O.map(identifier => identifier.name)
  );

  pipe(
    name,
    O.filter(name => /^[A-Z]/.test(name)),
    O.map(name => b.object({ id, component: b.ident(name) })),
    O.map(hydration => hydrations.push(hydration))
  );

  pipe(
    name,
    O.filter(name => /^[a-z]/.test(name)),
    O.map(() => {
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

      b.object({ id, ...attrs });
    })
  );

  pipe(
    el.children,
    A.map(child => {
      if (is.JSXElement(child)) {
        hydrations.push(createHydration2(child, filename));
      }

      pipe(
        child,
        O.fromNullableK(as.JSXExpressionContainer),
        O.map(c => c.expression),
        O.filter(not.JSXEmptyExpression),
        O.map(expression =>
          pipe(
            expression,
            findAllByTypeShallow("JSXElement"),
            A.map(jsxRoot => {
              const parent = findParent(jsxRoot, expression);
              const hydration = createHydration(jsxRoot, filename);

              if (!parent) {
                console.warn("No parent found for JSX root in", filename);
                return;
              }

              replaceChild(parent, hydration, jsxRoot);

              hydrations.push(expression);
            })
          )
        )
      );
    })
  );

  return b.array(hydrations);
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

      const isComponent = Boolean(component);

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

      pipe(
        el,
        findAllByType("JSXElement"),
        A.flatMap(child => child.children),
        A.filter(is.JSXExpressionContainer),
        A.map(child => child.expression),
        A.filter(not.JSXEmptyExpression),
        A.map(expr => {
          pipe(
            expr,
            findAllByTypeShallow("JSXElement"),
            A.map(jsxRoot => {
              const parent = findParent(jsxRoot, expr);
              const hydration = createHydration(jsxRoot, filename);

              if (!parent) {
                console.warn("No parent found for JSX root in", filename);
                return;
              }

              replaceChild(parent, hydration, jsxRoot);
            })
          );

          console.debug("---");
          console.debug(printHighlighted(expr));
        })
      );

      return isComponent || attrs ? O.some(b.object({ id, component, ...attrs })) : O.none;
    })
  );

  return b.array(hydration);
}
