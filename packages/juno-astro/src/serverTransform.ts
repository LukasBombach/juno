import { basename } from "node:path";
import { createHash } from "node:crypto";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, b, matches } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType } from "juno-ast";
import type { NodeOfType } from "juno-ast";

export function transformJsxServer(input: string, id: string) {
  const { program } = oxc.parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "js" });

  pipe(
    program,
    findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"),
    A.map(fn => addComponentId(fn, id))
  );

  return print(program, tsx(), { indent: "  " });
}

function addComponentId(
  fn: NodeOfType<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">,
  filename: string
) {
  const shouldBeHydrated =
    pipe(
      fn,
      findAllByType("JSXElement"),
      A.some(el =>
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
              O.map(v => (is.JSXEmptyExpression(v.expression) ? b.identName("undefined") : v.expression)),
              O.toUndefined
            );
            return name && value ? len + 1 : len;
          }),
          len => len > 0
        )
      )
    ) ||
    pipe(
      fn,
      findAllByType("BinaryExpression"),
      A.some(node => {
        const typeofWindow = {
          type: "UnaryExpression",
          operator: "typeof",
          argument: {
            type: "Identifier",
            name: "window",
          },
        };

        const undef = {
          type: "Literal",
          value: "undefined",
        };
        return (
          [node.left, node.right].some(el => matches(typeofWindow)(el)) &&
          [node.left, node.right].some(el => matches(undef)(el))
        );
      })
    );

  if (shouldBeHydrated) {
    pipe(
      fn,
      findAllByTypeShallow("JSXElement"),
      A.map(jsxRoot =>
        jsxRoot.openingElement.attributes.unshift(
          b.jsxAttr("data-component-id", shortHash(`${filename.slice(-16)}:${fn.start}:${fn.end}`))
        )
      )
    );
  }
}

function shortHash(input: string, length = 5): string {
  return createHash("md5").update(input).digest("hex").substring(0, length);
}
