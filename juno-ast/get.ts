import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

export function get<N extends Node, P extends keyof N>(name: P) {
  return map((val: N) => val[name]);
}

import type { Option } from "juno-ast/pipe";

export function get2<N extends Node, P extends keyof N>(name: P): (node: Option<N>) => Option<N[P]> {
  return node => node?.[name];
}
