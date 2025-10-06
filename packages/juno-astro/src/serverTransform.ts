import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { parseSync } from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, not, as, b } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType } from "juno-ast";
import { astId } from "./sharedTransform";
import { findComponents, findClientIdentifiers } from "./sharedTransform";
import type { JSXElement } from "juno-ast";

export function transformJsxServer(input: string, id: string) {
  const { program } = parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "ts" });

  pipe(
    program,
    findComponents,
    A.flatMap(findAllByTypeShallow("ReturnStatement")),
    A.flatMap(findAllByTypeShallow("JSXElement")),
    A.map(jsxRoot => addHydrationIds(jsxRoot, id))
  );

  return print(program, tsx(), { indent: "  " });
}

function addHydrationIds(jsxRoot: JSXElement, filename: string) {
  const clientIndentifiers = findClientIdentifiers(jsxRoot);

  pipe(
    jsxRoot,
    findAllByType("JSXElement"),
    A.map(el => {
      const containsInteractiveAttributes = pipe(
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

      const containsInteractiveChildren = pipe(
        el.children,
        A.some(child => {
          return pipe(
            child,
            O.fromNullableK(as.JSXExpressionContainer),
            O.map(c => c.expression),
            O.filter(not.JSXEmptyExpression),
            O.map(expression => {
              const containsClientIdentifiers = pipe(
                expression,
                findAllByType("Identifier"),
                A.map(id => id.name),
                A.some(name => clientIndentifiers.includes(name))
              );
              return containsClientIdentifiers;
            }),
            O.getOrElse(() => false)
          );
        })
      );

      if (containsInteractiveAttributes || containsInteractiveChildren) {
        const id = astId(filename, el.openingElement);
        el.openingElement.attributes.unshift(b.jsxAttr("data-element-id", id));
      }
    })
  );
}
