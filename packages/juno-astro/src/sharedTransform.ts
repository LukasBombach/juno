import { createHash } from "node:crypto";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { highlight } from "cli-highlight";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { is, as, b } from "juno-ast";
import { pipe, matches, findAllByType, findFirstByType, findAllByTypeWithParents } from "juno-ast";
import { contains } from "juno-ast";
import type { Node, NodeOfType } from "juno-ast";

export function astId(filename: string, node: Node): string {
  return createHash("md5")
    .update(`${filename.slice(-16)}:${node.start}:${node.end}`)
    .digest("hex")
    .substring(0, 5);
}

export function findComponents(
  root: Node
): NodeOfType<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">[] {
  return pipe(
    root,
    findAllByTypeWithParents("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"),
    A.filter(([fn, parents]) => {
      // 1.  should contain (actually return) a jsx element, so it's a component
      // 2.  but sometimes we have {arr.map(x => <JSXElement />)} inside others jsx,
      //     so we don't want to return these inner functions.
      // 2a. the outer function will already be returned.
      return pipe(fn, contains("JSXElement")) && !parents.some(p => is.JSXElement(p));
    }),
    A.map(([fn]) => fn)
  );
}

export function containsWindowDefinedCheck(fn: Node): boolean {
  return pipe(
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

      const def = {
        type: "Literal",
        value: "defined",
      };

      const undef = {
        type: "Literal",
        value: "undefined",
      };

      return (
        [node.left, node.right].some(el => matches(typeofWindow)(el)) &&
        ((["!=", "!=="].includes(node.operator) && [node.left, node.right].some(el => matches(undef)(el))) ||
          (["==", "==="].includes(node.operator) && [node.left, node.right].some(el => matches(def)(el))))
      );
    })
  );
}

export function containsInteractiveJsx(fn: Node): boolean {
  return pipe(
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
            O.map(v => (is.JSXEmptyExpression(v.expression) ? b.ident("undefined") : v.expression)),
            O.toUndefined
          );
          return name && value ? len + 1 : len;
        }),
        len => len > 0
      )
    )
  );
}

export function printHighlighted(node: Node) {
  return highlight(print(node, tsx(), { indent: "  " }).code, { language: "tsx", ignoreIllegals: true });
}
