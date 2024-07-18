import type { Node } from "juno-ast/parse";
import type { PipableValue, Option } from "juno-ast/pipe";

export function get<N extends Node, P extends keyof N>(
  name: P
): (val: PipableValue<N>) => PipableValue<N> extends Option<N> ? Option<N[P]> : Array<N[P]> {
  return (val) => (Array.isArray(val) ? val.map((v) => v[name]) : val?.[name]);
}
