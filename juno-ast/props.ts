import type { Node } from "juno-ast/parse";
import type { PipableValue, Option } from "juno-ast/pipe";

export function get<N extends Node, P extends keyof N>(
  name: P
) /* : (val: PipableValue<N>) => PipableValue<N> extends Option<N> ? Option<N[P]> : Array<N[P]> */ {
  return map<N, N[P]>((val) => val[name]);
  // return (val) => (Array.isArray(val) ? val.map((v) => v[name]) : val?.[name]);
}

//function map<T, R>(mapFn: (value: T) => R): (value: undefined) => undefined;
function map<T, R>(mapFn: (value: T) => R): (value: T) => R;
function map<T, R>(mapFn: (value: T) => R): (value: T[]) => R[];
function map<T, R>(mapFn: (value: T) => R) {
  return (value: T | T[]): R | R[] | undefined => {
    if (value === undefined) return undefined;
    if (Array.isArray(value)) return value.map(mapFn);
    return mapFn(value);
  };
}

/* function map<T, R>(mapFn: (val: T) => R) {
  return (val: undefined | T | T[]): T extends undefined ? undefined : T extends Array<any> ? R[] : R => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return val.map(mapFn);
    return mapFn(val) as R;
  };
} */

/* function PipeReturn<T, R>(val: undefined): undefined;
function PipeReturn<T, R>(val: T): R;
function PipeReturn<T, R>(val: T[]): R[];
function PipeReturn<T, R>(val: T | T[]): R | R[] | undefined {
  if (val === undefined) return undefined;
  if (Array.isArray(val)) return val as R[];
  return val as R;
} */
