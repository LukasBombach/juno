import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

export function get<N extends Node, P extends keyof N, V extends N | N[]>(
  name: P
): (node: V) => V extends N[] ? N[P][] : N[P] {
  return map((val: N) => val[name]);
}
