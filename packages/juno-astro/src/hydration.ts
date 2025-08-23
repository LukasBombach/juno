import { is, matches } from "juno-ast";
import type { Node } from "juno-ast";

export function windowAvailableCheck(node: Node): boolean {
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
    is.BinaryExpression(node) &&
    [node.left, node.right].some(el => matches(typeofWindow)(el)) &&
    [node.left, node.right].some(el => matches(undef)(el))
  );
}
