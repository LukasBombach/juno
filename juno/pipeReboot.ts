import { isMatchWith } from "lodash";
import { traverse } from "juno-ast/traverse";
import type { Node, NodeType, NodeTypeMap } from "juno-ast/parse";

import type * as t from "@swc/types";

type UnArray<T> = T extends (infer U)[] ? U : T;
type NonNull<T> = T extends undefined ? never : T;

// export interface PipeApi {
//   pipe: typeof pipe;
//   ancestors: (from: Node) => Generator<Node>;
// }

// todo
type PipeApi = undefined;

export function findAll<T extends NodeType>(
  query: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? NodeTypeMap[T][][] : NodeTypeMap[T][] {
  // @ts-expect-error todo fix types
  return input => {
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
      return input.map(node => {
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
  // @ts-expect-error todo fix types
  return input => {
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
      return input.map(node => {
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

/**
 * todo tests
 */
export function parent<T extends NodeType>(
  container: Node,
  query?: { type: T } & Record<string, unknown>
): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? NodeTypeMap[T][] : NodeTypeMap[T] | undefined {
  // @ts-expect-error todo fix types
  return input => {
    if (typeof input === "undefined") {
      return undefined;
    }

    const regexCustomizer = (objValue: unknown, srcValue: unknown) => {
      if (srcValue instanceof RegExp) {
        return srcValue.test(String(objValue));
      }
    };

    // console.log("input asd", input);

    if (Array.isArray(input)) {
      // console.log(">>>> PARENTS");

      // const parentMap = createParentMap(container);
      // parentMap.forEach((parent, child) => {
      //   console.log(child.type.padStart(20), "˿", parent.type);
      // });
      // console.log("<<<< PARENTS");

      return input
        .map(node => {
          // todo performance, generatig the parents every time here
          const parents = getParents(container)(node);

          // console.log(node, parentMap.get(node));

          return typeof query === "undefined"
            ? parents[0]
            : parents.find(parent => isMatchWith(parent, query, regexCustomizer));
        })
        .filter(result => typeof result !== "undefined");
    }

    // todo performance, generatig the parents every time here
    const parents = getParents(container)(input);
    return typeof query === "undefined"
      ? parents[0]
      : parents.find(parent => isMatchWith(parent, query, regexCustomizer));
  };
}

/**
 // todo Node<"Identifier"> will yield t.Identifier| t.BindingIdentifier because Extract<AnyNode, { type: "Identifier" }> catches both

export function getReferencesWithin(
  container: Node
): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? t.Identifier[][] : t.Identifier[] {
  throw new Error("todo getReferences");
} */

/* function resolveBinding(
  container: Node
): <Input extends Node | Node[]>(
  input?: Input
) => Input extends undefined
  ? undefined
  : Input extends Node[]
  ? Node<"VariableDeclaration">[]
  : Node<"VariableDeclaration"> | undefined {
  return input => {
    if (typeof input === "undefined") {
      return undefined;
    }

    if (Array.isArray(input)) {
      return input.map(node => {
        const parents = getParents(container)(node);
        const blocks = parents.filter(parent => parent.type === "BlockStatement");
      });
    }
  };
} */

function getParents(container: Node): (node: Node) => Node[] {
  const parentMap = createParentMap(container);

  return node => {
    const parents: Node[] = [];
    let current = node;
    while (parentMap.has(current)) {
      const parent = parentMap.get(current);
      if (parent) {
        parents.push(parent);
        current = parent;
      }
    }
    return parents;
  };
}

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

type Child = Node;
type Parent = Node;
type ParentMap = Map<Child, Parent>;
function createParentMap(node: Node, parentMap = new Map<Child, Parent>()): ParentMap {
  let parent = node;
  let property: keyof typeof parent;

  for (property in parent) {
    const child = parent[property];
    if (isNode(child)) {
      parentMap.set(child, parent);
      createParentMap(child, parentMap);
    }
    if (Array.isArray(child)) {
      for (const nthChild of child) {
        if (isNode(nthChild)) {
          parentMap.set(nthChild, parent);
          createParentMap(nthChild, parentMap);
        }
      }
    }
    if (typeof child === "object" && child !== null) {
      createParentMap(child, parentMap);
    }
  }

  return parentMap;
}

/**
 // todo Node<"Identifier"> will yield t.Identifier| t.BindingIdentifier because Extract<AnyNode, { type: "Identifier" }> catches both
 * @deprecated Not actually deprecated, I just want the IDE to strike through this function to show this to me as a todo
 */
export function getUsages(): <Input extends Node | Node[]>(
  input?: Input
) => Input extends Node[] ? t.Identifier[][] : t.Identifier[] {
  throw new Error("todo getReferences");
}

export function getProp<Input extends Node | Node[], K extends keyof UnArray<Input>>(
  key: K
): (input?: Input) => Input extends Node[] ? NonNull<UnArray<Input>[K]>[] : UnArray<Input>[K] {
  return input => {
    if (typeof input === "undefined") {
      return undefined;
    }

    if (Array.isArray(input)) {
      // todo typecast
      return input.map(node => (node as any)[key]);
    }

    // todo typecast
    return (input as any)[key];
  };
}

export function is<Input extends Node | Node[], T extends NodeType>(
  type: T
): (input?: Input) => Input extends Node[] ? NodeTypeMap[T][] : NodeTypeMap[T] | undefined {
  // @ts-expect-error todo fix types
  return input => {
    if (typeof input === "undefined") {
      return undefined;
    }

    if (Array.isArray(input)) {
      // todo bad types: we need to test if "type" in input only because input is typed as AnyNode | t.Argument
      return input.filter(node => "type" in node && node.type === type) as NodeTypeMap[T][];
    }

    // todo bad types: we need to test if "type" in input only because input is typed as AnyNode | t.Argument
    return "type" in input && input.type === type ? input : undefined;
  };
}

/**
 * @deprecated Not actually deprecated, I just want the IDE to strike through this function to show this to me as a todo
 */
export function has(
  query: Record<string, unknown>
): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? Input : Input | undefined {
  throw new Error("todo has");
}

/**
 * @deprecated Not actually deprecated, I just want the IDE to strike through this function to show this to me as a todo
 */
export function first(): <T, Input extends T[][] | T[]>(
  input: Input
) => Input extends (infer T)[][] ? T[] : Input extends (infer T)[] ? T | undefined : never {
  throw new Error("todo first");
}

/**
 * @deprecated Not actually deprecated, I just want the IDE to strike through this function to show this to me as a todo
 */
export function unique(): <Input extends Node | Node[]>(input?: Input) => Input extends Node[] ? Input : Input {
  throw new Error("todo unique");
}

export function replace<Input extends undefined | Node | Node[], Iterator = UnArray<Input>>(
  container: Node,
  fn: (iterator: Iterator, index: number) => Node
): (input: Input) => void {
  return input => {
    if (typeof input === "undefined") {
      return;
    }

    if (Array.isArray(input)) {
      return input.map((node, i) => {
        // const parentMap = createParentMap(container);

        // parentMap.forEach((parent, child) => {
        //   console.log(child.type.padStart(20), "˿", parent.type);
        // });

        // const parent = getParents(container)(node)[0];

        const parent = createParentMap(container).get(node);

        if (!parent) {
          throw new Error("Could not find a parent for the node " + node.type);
        }

        const property = Object.entries(parent).find(([, value]) =>
          Array.isArray(value) ? value.includes(node) : value === node
        )?.[0] as keyof typeof parent | undefined;

        if (!property) {
          // @ts-expect-error it's actually not allowed to pass data to the error
          throw new Error("Could not node in any property of the given parent", { node, parent });
        }

        if (Array.isArray(parent[property])) {
          const index = parent[property].indexOf(node);
          parent[property][index] = fn(parent[property][index], i);
        } else {
          // @ts-expect-error todo fix types
          parent[property] = fn(parent[property], i);
        }
      });
    }

    throw new Error("not implemented: replace for a single element");

    /* const node = input;
    // @ts-expect-error what's happening here?
    const parent = createParentMap(container).get(node);

    if (!parent) {
      // @ts-expect-error it's actually not allowed to pass data to the error
      throw new Error("Could not find a parent for the node", { node });
    }

    const property = Object.entries(parent).find(([, value]) =>
      Array.isArray(value) ? value.includes(node) : value === node
    )?.[0] as keyof typeof parent | undefined;

    if (!property) {
      // @ts-expect-error it's actually not allowed to pass data to the error
      throw new Error("Could not node in any property of the given parent", { node, parent });
    }

    if (Array.isArray(parent[property])) {
      // @ts-expect-error todo fix types
      parent[property] = parent[property].map((child: Node) => (child === node ? fn(child as Iterator, 0) : child));
    } else {
      // @ts-expect-error todo fix types
      parent[property] = fn(parent[property], 0);
    } */
  };
}

export function forEach<Input extends undefined | Node | Node[], Iterator = NonNullable<UnArray<Input>>>(
  fn: (iterator: Iterator) => any
): (input: Input) => void {
  return input => {
    if (typeof input === "undefined") {
      return;
    }

    if (Array.isArray(input)) {
      for (const node of input) {
        fn(node);
      }
      return;
    }

    // @ts-expect-error todo fix types
    fn(input);
  };
}

/**
 * @deprecated Not actually deprecated, I just want the IDE to strike through this function to show this to me as a todo
 */
export function map<Input extends undefined | Node | Node[], Output, Iterator = UnArray<Input>, Return = Output>(
  fn: (iterator: Iterator, index: number) => Output
): (input: Input) => Return {
  throw new Error("todo forEach");
}

export function flat(): <T>(arr: T[]) => T;
export function flat(): <T>(arr: T[][]) => T[];
export function flat(): <T>(arr: T[][]) => T[] {
  return arr => arr.flat();
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
  /* let module = a;
  const api = { pipe, ancestors };

  const ancestorMap = new Map<Node, Node>();
  for (const [child, parent] of traverse(module)) ancestorMap.set(child, parent);
  function* ancestors(node: Node): Generator<Node> {
    let current: Node | undefined = ancestorMap.get(node);
    while (current) {
      yield current;
      current = ancestorMap.get(current);
    }
  } */

  const api = undefined;

  for (let i = 0; i < fns.length; i++) {
    val = fns[i](val, api);
  }
  return val;
}
