import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, b } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType } from "juno-ast";
import { astId } from "./sharedTransform";
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
  component: NodeOfType<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">,
  filename: string
) {
  pipe(
    component,
    findAllByTypeShallow("JSXElement"),
    A.map(jsxRoot => {
      const id = astId(filename, component);
      jsxRoot.openingElement.attributes.unshift(b.jsxAttr("data-component-root", id));
    })
  );
}

function addHydrationIds(jsxRoot: JSXElement, filename: string) {
  pipe(
    jsxRoot,
    findAllByType("JSXElement"),
    A.map(el => {
      const shouldBeHydrated = pipe(
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
        const id = astId(filename, el.openingElement);
        el.openingElement.attributes.unshift(b.jsxAttr("data-element-id", id));
      }
    })
  );
}
