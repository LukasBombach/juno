import { basename } from "node:path";
import { createHash } from "node:crypto";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
// import { highlight } from "cli-highlight";
// import c from "chalk";
import { pipe, is, as, b, matches } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType } from "juno-ast";
import type { Node, NodeOfType, JSXElement } from "juno-ast";

export function windowAvailableCheck(node: Node): boolean {
  const typeofWindow /*:  Partial<NodeOfType<"UnaryExpression">> */ = {
    type: "UnaryExpression",
    operator: "typeof",
    argument: {
      type: "Identifier",
      name: "window",
    },
  };

  return is.BinaryExpression(node) && [node.left, node.right].some(el => matches(typeofWindow)(el));
}
