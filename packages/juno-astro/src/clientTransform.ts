import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import { parseSync } from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, not, b, replaceChild, findAllByTypeWithParents } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import { astId, findComponents, findClientIdentifiers, containsIdentifiers, takeUntilLast } from "./sharedTransform";
import type { Option } from "fp-ts/Option";
import type { JSXElement, Expression, Program, ArrowFunctionExpression, NumericLiteral } from "juno-ast";
import type * as t from "juno-ast";

export function transformJsxClient(input: string, filename: string) {
  const { program } = parseSync(basename(filename), input, { sourceType: "module", lang: "tsx", astType: "ts" });

  const components = pipe(program, findComponents);

  // console.log("\n" + filename + "\n");

  addJunoComponentsMap(program, filename);
  transformJsx(program, filename);

  const clientComponents = pipe(
    components,
    A.map(component => {
      // console.log("processing", component.id?.name);

      if (component.id?.name === "Playground") {
        // console.dir(component, { depth: null });
      }

      return component;
    }),
    A.filter(component => {
      if (component.id?.name === "Playground") {
        console.log("Client components found:", component.id?.name);

        console.dir(pipe(component, findAllByType("ReturnStatement")), { depth: null });
      }

      return pipe(
        component,
        findAllByType("ReturnStatement"),
        A.some(returnStatement =>
          pipe(
            O.fromNullable(returnStatement.argument),
            O.filter(arg => arg.type === "ArrayExpression"),
            O.map(arr => arr.elements.length > 0),
            O.getOrElse(() => false)
          )
        )
      );
    })
  );

  pipe(
    clientComponents,
    A.map(fn => {
      program.body.push(
        b.ExpressionStatement(
          b.AssignmentExpression(
            b.MemberExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), astId(filename, fn)),
            // @ts-expect-error wip
            b.ident(fn.id?.name)
          )
        )
      );
    })
  );

  return print(program, tsx(), { indent: "  " });
}

function transformJsx(program: Program, filename: string) {
  pipe(program, findComponents, fn => {
    pipe(
      fn,
      A.flatMap(findAllByTypeShallow("ReturnStatement")),
      A.map(returnStatement => transformJsxRoots(returnStatement, filename))
    );
  });
}

function transformJsxRoots(node: t.Node, filename: string) {
  pipe(
    node,
    findAllByTypeShallow("JSXElement"),
    A.map(jsxRoot => {
      // const grandParent = directParent ? findParent(jsxRoot, directParent) : null;
      // const parent = is.ParenthesizedExpression(grandParent) ? grandParent : directParent;
      const clientIndentifiers = findClientIdentifiers(jsxRoot);

      // if (!parent) {
      //   console.warn("No parent found for JSX root in", filename);
      //   return;
      // }

      const hydrations = pipe(
        jsxRoot,
        findAllByTypeWithParents("JSXElement"),
        A.filter(([, parents]) => !pipe(parents, A.some(is.JSXExpressionContainer))),
        A.filterMap(([jsxEl]) => createHydration(filename, jsxEl, clientIndentifiers)),
        hs => b.array(hs)
      );

      const rootParent = findParent(jsxRoot, node);

      const oldChild = is.ParenthesizedExpression(rootParent) ? rootParent : jsxRoot;
      const parentForReplacement = findParent(oldChild, node);

      if (!parentForReplacement) {
        console.warn("No parent found for JSX root in", filename);
        return;
      }

      const newChild = hydrations;

      replaceChild(parentForReplacement, newChild, oldChild);
    })
  );
}

function createHydration(filename: string, el: JSXElement, identifiers: string[]) {
  const elementId = astId(filename, el.openingElement);

  const elementName = pipe(
    O.fromNullable(as.JSXIdentifier(el.openingElement.name)),
    O.map(identifier => identifier.name),
    O.toUndefined
  );

  const isComponent = pipe(
    O.fromNullable(elementName),
    O.filter(name => /^[A-Z]/.test(name)),
    O.isSome
  );

  if (isComponent) {
    return O.some(
      b.object({
        component: b.ident(elementName!),
        props: pipe(
          el.openingElement,
          findAllByType("JSXAttribute"),
          A.filter(attr =>
            pipe(
              O.fromNullable(attr.value),
              O.filter(is.JSXExpressionContainer),
              O.map(c => c.expression),
              O.filter(not.JSXEmptyExpression),
              O.filter(expr => containsIdentifiers(expr, identifiers)),
              O.isSome
            )
          ),
          A.filterMap(attr => {
            const name = as.JSXIdentifier(attr.name)?.name;
            const value = pipe(
              attr,
              O.fromNullableK(findFirstByType("JSXExpressionContainer")),
              O.map(v => (is.JSXEmptyExpression(v.expression) ? b.ident("undefined") : v.expression)),
              O.toUndefined
            );
            return name && value ? O.some([name, value] as [string, Expression]) : O.none;
          }),
          A.match(() => ({} as Record<string, Expression>), R.fromEntries),
          props => b.object(props)
        ),
      })
    );
  } else {
    const props = pipe(
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
        return name && value ? O.some([name, value] as [string, Expression]) : O.none;
      })
    );

    const children = pipe(
      el.children,
      A.filter(child => is.JSXText(child) || is.JSXExpressionContainer(child)),
      A.filterMapWithIndex((index, child): Option<ArrowFunctionExpression | NumericLiteral> => {
        /**
         * JSXText
         */
        if (is.JSXText(child)) {
          const isFirst = index === 0;
          const isLast = index === el.children.length - 1;

          // This is how the Browser collapses whitespace in text nodes
          const length = isFirst
            ? child.value.trimStart().length
            : isLast
            ? child.value.trimEnd().length
            : Math.max(child.value.trim().length, 1);

          return O.fromNullable(length ? b.number(length) : undefined);
        } else {
          /**
           * JSXExpressionContainer
           */
          return pipe(
            child.expression,
            O.fromPredicate(not.JSXEmptyExpression),
            O.filter(expr => containsIdentifiers(expr, identifiers)),
            O.map(expr => {
              transformJsxRoots(expr, filename);
              return expr;
            }),
            O.map(expr => b.ArrowFunctionExpression([], expr))
          );
        }
      }),
      takeUntilLast<ArrowFunctionExpression | NumericLiteral>(is.ArrowFunctionExpression)
    );

    if (props.length || children.length) {
      return O.some(
        b.object({
          name: b.literal(elementName ?? ""),
          elementId: b.literal(elementId),
          ...(props.length ? R.fromEntries(props) : {}),
          ...(children.length ? { children: b.array(children) } : {}),
        })
      );
    } else {
      return O.none;
    }
  }
}

/**
 * window.JUNO_COMPONENTS preflight:
 *
 * window.JUNO_COMPONENTS = window.JUNO_COMPONENTS ?? {};
 * window.JUNO_COMPONENTS["a12e"] = Component;
 */
function addJunoComponentsMap(program: Program, filename: string) {
  program.body.push(
    b.ExpressionStatement(
      b.AssignmentExpression(
        b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"),
        b.LogicalExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), "??", b.object({}))
      )
    )
  );
  pipe(
    program,
    findComponents,
    A.map(fn => {
      program.body.push(
        b.ExpressionStatement(
          b.AssignmentExpression(
            b.MemberExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), astId(filename, fn)),
            // @ts-expect-error wip
            b.ident(fn.id?.name)
          )
        )
      );
    })
  );
}
