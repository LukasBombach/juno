import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

export function get<N extends Node, P extends keyof N>(name: P) {
  return map((val: N) => val[name]);
}
