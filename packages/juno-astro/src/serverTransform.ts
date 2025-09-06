import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, b } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType } from "juno-ast";
import { astId, containsInteractiveJsx, containsWindowDefinedCheck } from "./sharedTransform";
import { findComponents } from "./sharedTransform";
import type { NodeOfType, JSXElement } from "juno-ast";

export function transformJsxServer(input: string, id: string) {
  const { program } = oxc.parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "ts" });

  pipe(
    program,
    findComponents,
    A.map(fn => addComponentId(fn, id))
  );

  pipe(
    program,
    findComponents,
    A.flatMap(findAllByTypeShallow("ReturnStatement")),
    A.flatMap(findAllByTypeShallow("JSXElement")),
    A.map(jsxRoot => addHydrationIds(jsxRoot, id))
  );

  return print(program, tsx(), { indent: "  " });
}

function addComponentId(
  fn: NodeOfType<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">,
  filename: string
) {
  const componentShouldBeHydrated = containsInteractiveJsx(fn) || containsWindowDefinedCheck(fn);

  if (componentShouldBeHydrated) {
    pipe(
      fn,
      findAllByTypeShallow("JSXElement"),
      A.map(jsxRoot => {
        /*
        const props = pipe(
          jsxRoot.openingElement.attributes,
          A.filter(is.JSXAttribute),
          A.filter(attr => attr.value?.type === "JSXExpressionContainer"),
          A.map(
            attr =>
              [
                (attr.name as NodeOfType<"JSXIdentifier">).name,
                (attr.value as NodeOfType<"JSXExpressionContainer">).expression,
              ] as const
          ),
          // @ ts-expect-error wip
          entries => b.object(Object.fromEntries(entries))
        );

        jsxRoot.openingElement.attributes.unshift(
          b.jsxAttr(
            "data-component-props",
            b.CallExpression(
              b.MemberExpression(
                b.CallExpression(b.MemberExpression(b.ident("JSON"), "stringify"), [props]),
                "replaceAll"
              ),
              [b.literal('"'), b.literal("&quot;")]
            )
          )
        ); */

        // a2517
        const id = astId(filename, fn);
        jsxRoot.openingElement.attributes.unshift(b.jsxAttr("data-component-id", id));
      })
    );
  }
}

function addHydrationIds(jsxRoot: JSXElement, filename: string) {
  pipe(
    jsxRoot,
    findAllByType("JSXElement"),
    A.map(el => {
      const shouldBeHydrated =
        as.JSXIdentifier(el.openingElement.name)?.name.match(/^[A-Z]/) ||
        pipe(
          el.openingElement,
          findAllByType("JSXAttribute"),
          A.filter(attr => {
            const name = as.JSXIdentifier(attr.name)?.name;
            return name === "ref" || Boolean(name?.match(/^on[A-Z]/));
          }),
          A.reduce(0, (len, attr) => {
            const name = as.JSXIdentifier(attr.name)?.name;
            const value = pipe(
              attr,
              O.fromNullableK(findFirstByType("JSXExpressionContainer")),
              O.map(v => (is.JSXEmptyExpression(v.expression) ? b.ident("undefined") : v.expression)),
              O.toUndefined
            );
            return name && value ? len + 1 : len;
          }),
          len => len > 0
        );

      if (shouldBeHydrated) {
        el.openingElement.attributes.unshift(b.jsxAttr("data-element-id", astId(filename, el.openingElement)));
      }
    })
  );
}
