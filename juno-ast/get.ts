import { map } from "juno-ast/map";
import type { Node } from "juno-ast/parse";

/* type UnArray<T> = T extends (infer U)[] ? U : T;

export function get<N extends Node | Node[] | undefined, P extends keyof UnArray<N>>(
  name: P
): (node: N) => N extends Node[] ? UnArray<N>[P][] : N extends Node ? UnArray<N>[P] : undefined {
  return map((val: N) => val[name]);
}
 */

type PropertyAccessor<T> = {
  <K extends keyof T>(obj: T): T[K];
  <K extends keyof T>(obj: T[]): T[K][];
  <K extends keyof T>(obj: undefined): undefined;
  <K extends keyof T>(obj: T | T[] | undefined): T[K] | T[K][] | undefined;
};

function createPropertyAccessor<T>(): <K extends keyof T>(propertyName: K) => PropertyAccessor<T> {
  return <K extends keyof T>(propertyName: K) => {
    const accessor = (obj: T | T[] | undefined): T[K] | T[K][] | undefined => {
      if (obj === undefined) {
        return undefined;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => item[propertyName]);
      }
      return obj[propertyName];
    };

    return accessor as PropertyAccessor<T>;
  };
}

export const get = createPropertyAccessor;
