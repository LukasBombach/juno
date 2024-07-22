import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

type UnArray<T> = T extends (infer U)[] ? U : T;

export function get<N extends Node | Node[] | undefined, P extends keyof UnArray<N>>(
  name: P
): (node: N) => N extends Node[] ? UnArray<N>[P][] : N extends Node ? UnArray<N>[P] : undefined {
  return map((val: N) => val[name]);
}
