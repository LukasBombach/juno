import type { Node, NodeType } from "juno-ast/parse";

type QueryObject<T = any> = {
  [K in keyof T]: T[K] extends { type: string } ? QueryObject<T[K]> : T[K];
} & {
  type?: string;
};

type DeepestType<T> = T extends { type: infer U }
  ? U extends string
    ? T
    : never
  : T extends object
  ? DeepestType<T[keyof T]>
  : never;

function findFirst<T extends QueryObject>(data: any, query: T): DeepestType<T> {}

const x = findFirst({ type: "FunctionExpression" }, { type: "FunctionExpression" });
