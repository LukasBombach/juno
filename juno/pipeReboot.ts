import { isMatchWith } from "lodash";
import { traverse } from "juno-ast/traverse";
import type { Node, NodeType, NodeTypeMap } from "juno-ast/parse";

import type * as t from "@swc/types";

type UnArray<T> = T extends (infer U)[] ? U : T;
type NonNull<T> = T extends undefined ? never : T;

export interface PipeApi {
  pipe: typeof pipe;
  ancestors: (from: Node) => Generator<Node>;
}

export function findAll<T extends NodeType>(
  query: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? NodeTypeMap[T][][] : NodeTypeMap[T][] {
  // todo fix types
  // @ts-expect-error i believe that ts is dumb here
  return (input) => {
    if (typeof input === "undefined") {
      return [];
    }

    const regexCustomizer = (objValue: unknown, srcValue: unknown) => {
      if (srcValue instanceof RegExp) {
        return srcValue.test(String(objValue));
      }
    };

    const { index, ...props } = query;

    if (Array.isArray(input)) {
      return input.map((node) => {
        const result: NodeTypeMap[T][] = [];
        for (const [child, , , i] of traverse(node)) {
          if (isMatchWith(child, props, regexCustomizer) && (index === undefined || index === i)) {
            result.push(child as NodeTypeMap[T]); // todo typecast
          }
        }
        return result;
      });
    }

    const result: NodeTypeMap[T][] = [];
    for (const [child, , , i] of traverse(input)) {
      if (isMatchWith(child, props, regexCustomizer) && (index === undefined || index === i)) {
        result.push(child as NodeTypeMap[T]); // todo typecast
      }
    }
    return result;
  };
}

export function findFirst<T extends NodeType>(
  query: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? NodeTypeMap[T][] : NodeTypeMap[T] | undefined {
  // todo fix types
  // @ts-expect-error i believe that ts is dumb here
  return (input) => {
    if (typeof input === "undefined") {
      return undefined;
    }

    const regexCustomizer = (objValue: unknown, srcValue: unknown) => {
      if (srcValue instanceof RegExp) {
        return srcValue.test(String(objValue));
      }
    };

    const { index, ...props } = query;

    if (Array.isArray(input)) {
      return input.map((node) => {
        for (const [child, , , i] of traverse(node)) {
          if (isMatchWith(child, props, regexCustomizer) && (index === undefined || index === i)) {
            return child as NodeTypeMap[T]; // todo typecast
          }
        }
      });
    }

    for (const [child, , , i] of traverse(input)) {
      if (isMatchWith(child, props, regexCustomizer) && (index === undefined || index === i)) {
        return child as NodeTypeMap[T]; // todo typecast
      }
    }
  };
}

export function parent<T extends NodeType>(
  query: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? NodeTypeMap[T][] : NodeTypeMap[T] | undefined {
  throw new Error("todo parent");
}

// todo Node<"Identifier"> will yield t.Identifier| t.BindingIdentifier because Extract<AnyNode, { type: "Identifier" }> catches both
export function getReferences(): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? t.Identifier[][] : t.Identifier[] {
  throw new Error("todo getReferences");
}

// todo Node<"Identifier"> will yield t.Identifier| t.BindingIdentifier because Extract<AnyNode, { type: "Identifier" }> catches both
export function getUsages(): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? t.Identifier[][] : t.Identifier[] {
  throw new Error("todo getReferences");
}

export function getProp<Input extends Node | Node[], K extends keyof UnArray<Input>>(
  key: K
): (input?: Input) => Input extends Node[] ? NonNull<UnArray<Input>[K]>[] : UnArray<Input>[K] {
  throw new Error("todo get");
}

export function is<Input extends Node | Node[], T extends NodeType>(
  type: T
): (input?: Input) => Input extends Node[] ? Node<T>[] : Node<T> | undefined {
  throw new Error("todo is");
}

export function has(
  query: Record<string, unknown>
): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? Input : Input | undefined {
  throw new Error("todo has");
}

export function first(): <T, Input extends T[][] | T[]>(
  input: Input
) => Input extends (infer T)[][] ? T[] : Input extends (infer T)[] ? T | undefined : never {
  throw new Error("todo first");
}

export function unique(): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? Input : Input {
  throw new Error("todo unique");
}

export function replace<Input extends undefined | Node | Node[], Iterator = UnArray<Input>>(
  fn: (iterator: Iterator, index: number) => string | Node
): (input: Input) => void {
  throw new Error("todo replace");
}

export function forEach<Input extends undefined | Node | Node[], Iterator = UnArray<Input>>(
  fn: (iterator: Iterator) => any
): (input: Input) => void {
  throw new Error("todo forEach");
}

export function map<Input extends undefined | Node | Node[], Output, Iterator = UnArray<Input>, Return = Output>(
  fn: (iterator: Iterator, index: number) => Output
): (input: Input) => Return {
  throw new Error("todo forEach");
}

export function flat(): <T>(arr: T[]) => T;
export function flat(): <T>(arr: T[][]) => T[];
export function flat(): <T>(arr: T[][]) => T[] {
  return (arr) => arr.flat();
}

export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A, api: PipeApi) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A, api: PipeApi) => B, bc: (b: B, api: PipeApi) => C): C;
export function pipe<A, B, C, D>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D
): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G,
  gh: (g: G, api: PipeApi) => H
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
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
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G,
  gh: (g: G, api: PipeApi) => H,
  hi: (h: H, api: PipeApi) => I,
  ij: (i: I, api: PipeApi) => J
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  a: A,
  ab: (a: A, api: PipeApi) => B,
  bc: (b: B, api: PipeApi) => C,
  cd: (c: C, api: PipeApi) => D,
  de: (d: D, api: PipeApi) => E,
  ef: (e: E, api: PipeApi) => F,
  fg: (f: F, api: PipeApi) => G,
  gh: (g: G, api: PipeApi) => H,
  hi: (h: H, api: PipeApi) => I,
  ij: (i: I, api: PipeApi) => J,
  jk: (j: J, api: PipeApi) => K
): K;
export function pipe(a: Node<"Module">, ...fns: ((val: any, api: PipeApi) => any)[]): unknown {
  let val = a;
  let module = a;
  const api = { pipe, ancestors };

  const ancestorMap = new Map<Node, Node>();
  for (const [child, parent] of traverse(module)) ancestorMap.set(child, parent);
  function* ancestors(node: Node): Generator<Node> {
    let current: Node | undefined = ancestorMap.get(node);
    while (current) {
      yield current;
      current = ancestorMap.get(current);
    }
  }

  for (let i = 0; i < fns.length; i++) {
    val = fns[i](val, api);
  }
  return val;
}
