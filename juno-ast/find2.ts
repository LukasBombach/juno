import type { Node, NodeType } from "juno-ast/parse";

/* type Query<T extends NodeType> = {
  [K in keyof T]: T[K] extends { type: T } ? Query<T[K]> : T[K];
} & {
  type?: string;
}; */

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type Query = DeepPartial<Node>;

type DeepestType<T> = T extends { type: infer U }
  ? U extends string
    ? T
    : never
  : T extends object
  ? DeepestType<T[keyof T]>
  : never;

function findFirst<Q extends Query>(data: any, query: Q): DeepestType<Q> {}

const x = findFirst({}, { type: "Parameter", index: 0, pat: { type: "Identifier" } });
