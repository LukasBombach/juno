import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/ReadonlyRecord";
import oxc from "oxc-parser";
import { print } from "esrap";
import c from "chalk";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, not, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import { astId, findComponents, findClientIdentifiers, printHighlighted } from "./sharedTransform";
import type { JSXElement, Expression } from "juno-ast";

export function transformJsxClient(input: string, filename: string) {
  const { program } = oxc.parseSync(basename(filename), input, { sourceType: "module", lang: "tsx", astType: "ts" });

  pipe(program, findComponents, fn => {
    pipe(
      fn,
      A.map(fn => {
        const componentId = astId(filename, fn);

        const x = b.ExpressionStatement(
          b.AssignmentExpression(
            b.MemberExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), componentId),
            // @ts-expect-error wip
            b.ident(fn.id?.name)
          )
        );

        program.body.push(x);

        return fn;
      }),
      A.flatMap(findAllByTypeShallow("ReturnStatement")),
      A.map(returnStatement => {
        pipe(
          returnStatement,
          findAllByTypeShallow("JSXElement"),
          A.map(jsxRoot => {
            const parent = findParent(jsxRoot, returnStatement);
            const clientIndentifiers = findClientIdentifiers(jsxRoot);

            console.debug("\n" + c.bgBlueBright(filename) + "\n");
            console.debug(printHighlighted(jsxRoot), "\n");

            const hydration2 = createHydration(jsxRoot, clientIndentifiers, filename);

            if (!parent) {
              console.warn("No parent found for JSX root in", filename);
              return;
            }

            replaceChild(parent, b.array(hydration2), jsxRoot);
          })
        );
      })
    );
  });

  return print(program, tsx(), { indent: "  " });
}

function createHydration(el: JSXElement, identifiers: string[], filename: string): Expression[] {
  const hydrations: Expression[] = [];

  const elementId = pipe(astId(filename, el.openingElement), b.literal);

  /**
   * JSX name
   */
  const name = pipe(
    O.fromNullable(as.JSXIdentifier(el.openingElement.name)),
    O.map(identifier => identifier.name)
  );

  /**
   * If it's a component (uppercase first letter), add component
   */
  pipe(
    name,
    O.filter(name => /^[A-Z]/.test(name)),
    O.map(name => b.object({ component: b.ident(name) })),
    O.map(hydration => {
      hydrations.push(hydration);
    })
  );

  /**
   * If it has reactive attributes (ref, event handlers, reactive children),
   * add JSX element with those attributes
   */
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

      if (attrs) {
        hydrations.push(b.object({ elementId, ...attrs }));
      }
    })
  );

  /**
   * Iterate the JSX element's children
   */
  pipe(
    el.children,
    A.map(child => {
      /**
       * Nested JSX element
       */
      if (is.JSXElement(child)) {
        hydrations.push(...createHydration(child, identifiers, filename));
      }

      /**
       * JSX expression container
       */
      pipe(
        child,
        O.fromNullableK(as.JSXExpressionContainer),
        O.map(c => c.expression),
        O.filter(not.JSXEmptyExpression),
        O.map(expression => {
          const containsClientIdentifiers = pipe(
            expression,
            findAllByType("Identifier"),
            A.map(id => id.name),
            A.some(name => identifiers.includes(name))
          );

          if (!containsClientIdentifiers) {
            return;
          }

          pipe(
            expression,
            findAllByType("JSXElement"),
            A.map(jsxRoot => {
              const parent = findParent(jsxRoot, expression);
              const hydration = createHydration(jsxRoot, identifiers, filename);

              if (!parent) {
                console.warn("No parent found for JSX root in", filename);
                return;
              }

              replaceChild(parent, b.array(hydration), jsxRoot);
            })
          );

          const hydration = b.ArrowFunctionExpression([], expression);

          hydrations.push(hydration);
        })
      );
    })
  );

  console.debug(printHighlighted(b.array(hydrations)));

  return hydrations;
}
