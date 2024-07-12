import { mapAncestors } from "juno/transform-fp2";

import type * as t from "@swc/types";
import type { Ancestors } from "juno/node";

type Pipe = typeof pipe;

export function createPipe(module: t.Module): Pipe {
  const ancestors = mapAncestors(module);
  return (a: unknown, ...fns: Function[]): unknown => {
    let val = a;
    for (let i = 0; i < fns.length; i++) {
      val = fns[i](val, ancestors);
    }
    return val;
  };
}

function pipe<A>(a: A): A;
function pipe<A, B>(a: A, ab: (a: A, ancestors: Ancestors) => B): B;
function pipe<A, B, C>(a: A, ab: (a: A, ancestors: Ancestors) => B, bc: (b: B, ancestors: Ancestors) => C): C;
function pipe<A, B, C, D>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D
): D;
function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E
): E;
function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F
): F;
function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F,
  fg: (f: F, ancestors: Ancestors) => G
): G;
function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F,
  fg: (f: F, ancestors: Ancestors) => G,
  gh: (g: G, ancestors: Ancestors) => H
): H;
function pipe<A, B, C, D, E, F, G, H, I>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F,
  fg: (f: F, ancestors: Ancestors) => G,
  gh: (g: G, ancestors: Ancestors) => H,
  hi: (h: H, ancestors: Ancestors) => I
): I;
function pipe() {
  throw new Error("Use createPipe instead of pipe directly");
}
