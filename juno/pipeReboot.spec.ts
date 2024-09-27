import { describe, test, expect } from "vitest";
import { parse } from "juno-ast/parse";
import { findAll } from "./pipeReboot";

import type { Node } from "juno-ast/parse";

describe("pipeReboot", () => {
  describe("findAll", async () => {
    const module = await parse(`const a = 1; const b = 2; let c = 3;`);

    test("no matches when the input is undefined", async () => {
      expect(findAll({ type: "VariableDeclaration" })(undefined)).toEqual([]);
    });

    test.each`
      query                                                                          | input     | expectedLength
      ${{ type: "FunctionDeclaration" }}                                             | ${module} | ${0}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "d" } }] }}     | ${module} | ${0}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[A-Z]/ } }] }} | ${module} | ${0}
    `("no matches of the query", async ({ query, input, expectedLength }) => {
      expect(findAll(query)(input)).toHaveLength(expectedLength);
    });

    test.each`
      query                                                                          | input     | expectedLength
      ${{ type: "VariableDeclaration" }}                                             | ${module} | ${3}
      ${{ type: "VariableDeclaration", kind: "const" }}                              | ${module} | ${2}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "a" } }] }}     | ${module} | ${1}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] }} | ${module} | ${3}
    `("expected number matches of the query", async ({ query, input, expectedLength }) => {
      expect(findAll(query)(input)).toHaveLength(expectedLength);
    });

    test.each`
      query                                                                          | input               | expectedLengths
      ${{ type: "FunctionDeclaration" }}                                             | ${[module, module]} | ${[0, 0]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "d" } }] }}     | ${[module, module]} | ${[0, 0]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[A-Z]/ } }] }} | ${[module, module]} | ${[0, 0]}
    `("no matches of the query in an array", async ({ query, input, expectedLengths }) => {
      expect(findAll(query)(input as Node[]).map((r) => r.length)).toEqual(expectedLengths);
    });

    test.each`
      query                                                                          | input               | expectedLengths
      ${{ type: "VariableDeclaration" }}                                             | ${[module, module]} | ${[3, 3]}
      ${{ type: "VariableDeclaration", kind: "const" }}                              | ${[module, module]} | ${[2, 2]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: "a" } }] }}     | ${[module, module]} | ${[1, 1]}
      ${{ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] }} | ${[module, module]} | ${[3, 3]}
    `("expected number matches of the query in an array", async ({ query, input, expectedLengths }) => {
      expect(findAll(query)(input as Node[]).map((r) => r.length)).toEqual(expectedLengths);
    });
  });
});
