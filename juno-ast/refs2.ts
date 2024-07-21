import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

export function getReferences() {
  return map<Node, Node<"Identifier">[]>((node) => {});
}
