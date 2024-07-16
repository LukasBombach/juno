import type { Node } from "juno-ast/parse";
import type { Option } from "juno-ast/pipe";

export function get<N extends Node, P extends keyof N>(name: P): (node: Option<N>) => Option<N[P]> {
  return (node) => node?.[name];
}
