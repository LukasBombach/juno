import type { Ancestors } from "juno/node";

export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A, ancestors: Ancestors) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A, ancestors: Ancestors) => B, bc: (b: B, ancestors: Ancestors) => C): C;
export function pipe<A, B, C, D>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D
): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F,
  fg: (f: F, ancestors: Ancestors) => G
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A, ancestors: Ancestors) => B,
  bc: (b: B, ancestors: Ancestors) => C,
  cd: (c: C, ancestors: Ancestors) => D,
  de: (d: D, ancestors: Ancestors) => E,
  ef: (e: E, ancestors: Ancestors) => F,
  fg: (f: F, ancestors: Ancestors) => G,
  gh: (g: G, ancestors: Ancestors) => H
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
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
export function pipe(
  a: unknown,
  ab?: Function,
  bc?: Function,
  cd?: Function,
  de?: Function,
  ef?: Function,
  fg?: Function,
  gh?: Function,
  hi?: Function
): unknown {
  switch (arguments.length) {
    case 1:
      return a;
    case 2:
      return ab!(a);
    case 3:
      return bc!(ab!(a));
    case 4:
      return cd!(bc!(ab!(a)));
    case 5:
      return de!(cd!(bc!(ab!(a))));
    case 6:
      return ef!(de!(cd!(bc!(ab!(a)))));
    case 7:
      return fg!(ef!(de!(cd!(bc!(ab!(a))))));
    case 8:
      return gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))));
    case 9:
      return hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))));
    default: {
      let ret = arguments[0];
      for (let i = 1; i < arguments.length; i++) {
        ret = arguments[i](ret);
      }
      return ret;
    }
  }
}
