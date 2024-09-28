import { describe, test, expect, vi } from "vitest";
import { parse } from "juno-ast/parse";
import { findAll, findFirst } from "./pipeReboot";
import { getProp } from "./pipeReboot";
import { forEach } from "./pipeReboot";

describe("pipeReboot", async () => {
  const module = await parse(`const a = 1; const b = 2; let c = 3;`);

  const a = module.body[0];
  const b = module.body[1];
  const c = module.body[2];

  describe("findAll", () => {
    test("returns an empty array if the input is undefined", async () => {
      expect(findAll({ type: "VariableDeclaration" })(undefined)).toEqual([]);
    });

    test.each`
      query                                                                          | input     | expected
      ${{ type: "FunctionDeclaration" }}                                             | ${module} | ${[]}
      ${{ type: "VariableDeclaration" }}                                             | ${module} | ${[a, b, c]}
      ${{ type: "VariableDeclaration", kind: "const" }}                              | ${module} | ${[a, b]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "a" } }] }}     | ${module} | ${[a]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] }} | ${module} | ${[a, b, c]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "d" } }] }}     | ${module} | ${[]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[A-Z]/ } }] }} | ${module} | ${[]}
    `("returns all nodes matching the query", async ({ query, input, expected }) => {
      expect(findAll(query)(input)).toEqual(expected);
    });

    test.each`
      query                                                                          | input               | expected
      ${{ type: "FunctionDeclaration" }}                                             | ${[module, module]} | ${[[], []]}
      ${{ type: "VariableDeclaration" }}                                             | ${[module, module]} | ${[[a, b, c], [a, b, c]]}
      ${{ type: "VariableDeclaration", kind: "const" }}                              | ${[module, module]} | ${[[a, b], [a, b]]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "a" } }] }}     | ${[module, module]} | ${[[a], [a]]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] }} | ${[module, module]} | ${[[a, b, c], [a, b, c]]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "d" } }] }}     | ${[module, module]} | ${[[], []]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[A-Z]/ } }] }} | ${[module, module]} | ${[[], []]}
    `("returns all nodes matching the query in an array of nodes", async ({ query, input, expected }) => {
      expect(findAll(query)(input)).toEqual(expected);
    });
  });

  describe("findFirst", () => {
    test("returns undefined if the input is undefined", async () => {
      expect(findFirst({ type: "VariableDeclaration" })(undefined)).toBe(undefined);
    });

    test.each`
      query                                                                          | input     | expected
      ${{ type: "FunctionDeclaration" }}                                             | ${module} | ${undefined}
      ${{ type: "VariableDeclaration" }}                                             | ${module} | ${a}
      ${{ type: "VariableDeclaration", kind: "const" }}                              | ${module} | ${a}
      ${{ type: "VariableDeclaration", kind: "let" }}                                | ${module} | ${c}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "b" } }] }}     | ${module} | ${b}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] }} | ${module} | ${a}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "d" } }] }}     | ${module} | ${undefined}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[A-Z]/ } }] }} | ${module} | ${undefined}
    `("returns the first node matching the query", async ({ query, input, expected }) => {
      expect(findFirst(query)(input)).toBe(expected);
    });

    test.each`
      query                                                                          | input               | expected
      ${{ type: "FunctionDeclaration" }}                                             | ${[module, module]} | ${[undefined, undefined]}
      ${{ type: "VariableDeclaration" }}                                             | ${[module, module]} | ${[a, a]}
      ${{ type: "VariableDeclaration", kind: "const" }}                              | ${[module, module]} | ${[a, a]}
      ${{ type: "VariableDeclaration", kind: "let" }}                                | ${[module, module]} | ${[c, c]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "b" } }] }}     | ${[module, module]} | ${[b, b]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] }} | ${[module, module]} | ${[a, a]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "d" } }] }}     | ${[module, module]} | ${[undefined, undefined]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[A-Z]/ } }] }} | ${[module, module]} | ${[undefined, undefined]}
    `("returns the first node matching the query in an array of nodes", async ({ query, input, expected }) => {
      expect(findFirst(query)(input)).toEqual(expected);
    });
  });

  describe("forEach", async () => {
    test.each`
      input        | expected
      ${undefined} | ${[]}
      ${a}         | ${[[a]]}
      ${[a, b, c]} | ${[[a], [b], [c]]}
    `("calls the iterator for each value", async ({ input, expected }) => {
      const fn = vi.fn();
      forEach(fn)(input);
      expect(fn.mock.calls).toEqual(expected);
    });
  });

  describe("getProp", async () => {
    test.each`
      prop      | input               | expected
      ${"body"} | ${undefined}        | ${undefined}
      ${"body"} | ${module}           | ${module.body}
      ${"body"} | ${[module, module]} | ${[module.body, module.body]}
    `("returns the property of the input by its name", async ({ prop, input, expected }) => {
      // @ts-expect-error too annoying to type the test here, but the types work in prod
      expect(getProp(prop)(input)).toEqual(expected);
    });
  });
});
