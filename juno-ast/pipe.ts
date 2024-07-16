import { mapAncestors } from "juno/transform-fp2";

import type * as t from "@swc/types";
import type { Ancestors, Node } from "juno/node";

type PipableValue<T> = undefined | T | T[];

export type Pipable<T> = (a: PipableValue<T>, api: PipeApi) => PipableValue<T>;

export interface PipeApi {
  pipe: typeof _pipe;
  ancestors: Ancestors;
}

export function pipe(module: t.Module): typeof _pipe {
  const ancestorMap = mapAncestors(module);

  function* ancestors(node: Node): Generator<Node> {
    let current: Node | undefined = ancestorMap.get(node);
    while (current) {
      yield current;
      current = ancestorMap.get(current);
    }
  }

  function _pipe(a: unknown, ...fns: ((val: any, api: PipeApi) => any)[]): unknown {
    let val = a;
    for (let i = 0; i < fns.length; i++) {
      val = fns[i](val, { pipe: _pipe, ancestors });
    }
    return val;
  }

  return _pipe;
}

function _pipe<A>(a: A): A;
function _pipe<A, B>(a: A, ab: (a: A, api: PipeApi) => B): B;
function _pipe<A, B, C>(a: A, ab: (a: A, api: PipeApi) => B, bc: (b: B, api: PipeApi) => C): C;
function _pipe<A, B, C, D>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D
): D;
function _pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E
): E;
function _pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F
): F;
function _pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G
): G;
function _pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G,
  gh: (g: G, api: PipeApi) => H
): H;
function _pipe<A, B, C, D, E, F, G, H, I>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G,
  gh: (g: G, api: PipeApi) => H,
  hi: (h: H, api: PipeApi) => I
): I;
function _pipe() {
  throw new Error("Use createPipe instead of pipe directly");
}
