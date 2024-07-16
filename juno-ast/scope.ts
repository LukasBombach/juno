import type { Node } from "juno-ast/parse";
import type { PipeApi, Option, Ancestors } from "juno-ast/pipe";

export function getScope(): (node: Option<Node>, api: PipeApi) => Option<Node<"FunctionExpression" | "Module">> {
  return (node, { ancestors }) => (node ? scopes(node, ancestors).next().value : undefined);
}

export function* scopes<T = Node<"FunctionExpression" | "Module">>(node: Node, ancestors: Ancestors): Generator<T> {
  const scopeTypes = ["FunctionExpression", "Module"];

  for (const ancestor of ancestors(node)) {
    if (scopeTypes.includes(ancestor.type)) {
      // @ts-expect-error WORK IN PROGRESS
      yield ancestor;
    }
  }
}
