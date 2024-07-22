import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

/* type UnArray<T> = T extends (infer U)[] ? U : T;

export function get<N extends Node | Node[] | undefined, P extends keyof UnArray<N>>(
  name: P
): (node: N) => N extends Node[] ? UnArray<N>[P][] : N extends Node ? UnArray<N>[P] : undefined {
  return map((val: N) => val[name]);
}
 */

type PropertyAccessor<N extends Node, K extends keyof N> = {
  (obj: N): N[K];
  (obj: N[]): N[K][];
  (obj: undefined): undefined;
};

export function get<N extends Node, K extends keyof N>(propertyName: K): PropertyAccessor<N, K> {
  return ((obj: N | N[] | undefined) => {
    if (obj === undefined) {
      return undefined;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => item[propertyName]);
    }
    return obj[propertyName];
  }) as PropertyAccessor<N, K>;
}
