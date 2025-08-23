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
      .map(([key, value]) => b.prop(key, value)),
    ...span,
  }),
  prop: (key: string, value: t.Expression): t.ObjectProperty => ({
    type: "Property",
    kind: "init",
    key: b.identName(key),
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
  literal: (value: string): t.StringLiteral => ({
    type: "Literal",
    value,
    raw: JSON.stringify(value),
    ...span,
  }),
  number: (value: number): t.NumericLiteral => ({
    type: "Literal",
    value,
    raw: JSON.stringify(value),
    ...span,
  }),
  jsxAttr: (name: string, value: string): t.JSXAttribute => ({
    type: "JSXAttribute",
    name: {
      type: "JSXIdentifier",
      name,
      ...span,
    },
    value: b.literal(value),
    ...span,
  }),
  ExpressionStatement: (expression: t.Expression): t.ExpressionStatement => ({
    type: "ExpressionStatement",
    expression,
    ...span,
  }),
  AssignmentExpression: (left: t.MemberExpression, right: t.Expression): t.AssignmentExpression => ({
    type: "AssignmentExpression",
    operator: "=",
    left,
    right,
    ...span,
  }),
  StaticMemberExpression: (object: t.Expression, property: string): t.StaticMemberExpression => ({
    type: "MemberExpression",
    object,
    property: b.identName(property),
    optional: false,
    computed: false,
    ...span,
  }),
};

/**
 * A shorthand for the build functions because they are used frequently like this
 */
export const b = build;
