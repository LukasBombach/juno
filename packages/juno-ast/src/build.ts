import type * as t from "./types";

const span = { start: 0, end: 0 };

export const build = {
  array: (elements: t.Expression[]): t.ArrayExpression => ({
    type: "ArrayExpression",
    elements,
    ...span,
  }),
  object: (properties: Record<string, t.Expression | undefined>): t.ObjectExpression => ({
    type: "ObjectExpression",
    properties: Object.entries(properties)
      .map(([key, value]) => [key, value])
      .filter((e): e is [string, t.Expression] => e[1] !== undefined)
      .map(([key, value]) => build.prop(key, value)),
    ...span,
  }),
  prop: (key: string, value: t.Expression): t.ObjectProperty => ({
    type: "Property",
    kind: "init",
    key: build.identName(key),
    value,
    method: false,
    shorthand: false,
    computed: false,
    ...span,
  }),
  identName: (name: string): t.IdentifierName => ({
    type: "Identifier",
    name,
    ...span,
  }),
  number: (value: number): t.NumericLiteral => ({
    type: "Literal",
    value,
    raw: value.toString(),
    ...span,
  }),
};
