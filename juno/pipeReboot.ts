import { traverse } from "juno-ast/traverse";
import type { Node, NodeType, NodeTypeMap } from "juno-ast/parse";

type UnArray<T> = T extends (infer U)[] ? U : T;

export interface PipeApi {
  pipe: typeof pipe;
  ancestors: (from: Node) => Generator<Node>;
}

export function findFirst<T extends NodeType>(
  query: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? NodeTypeMap[T][] : NodeTypeMap[T] | undefined {
  throw new Error("todo");
}
export function findAll<T extends NodeType>(
  query: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? NodeTypeMap[T][][] : NodeTypeMap[T][] {
  throw new Error("todo");
}

export function get<Input extends Node | Node[], K extends keyof UnArray<Input>>(
  key: K
): (input?: Input) => Input extends Node[] ? UnArray<Input>[K][] : UnArray<Input>[K] {
  throw new Error("todo");
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
