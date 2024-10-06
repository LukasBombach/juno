import { describe, test, expect, vi } from "vitest";
import { parse } from "juno-ast/parse";
import { findFirst, findAll, parent } from "./pipeReboot";
import { getProp } from "./pipeReboot";
import { is, flat } from "./pipeReboot";
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

  describe("getProp", () => {
    test.each`
      prop      | input               | expected
      ${"body"} | ${undefined}        | ${undefined}
      ${"body"} | ${module}           | ${module.body}
      ${"body"} | ${[module, module]} | ${[module.body, module.body]}
    `("returns the property of the input by its name", async ({ prop, input, expected }) => {
      expect(getProp(prop)(input)).toEqual(expected);
    });
  });

  describe("is", () => {
    test.each`
      type                     | input          | expected
      ${"VariableDeclaration"} | ${undefined}   | ${undefined}
      ${"VariableDeclaration"} | ${a}           | ${a}
      ${"FunctionDeclaration"} | ${a}           | ${undefined}
      ${"VariableDeclaration"} | ${[a, b]}      | ${[a, b]}
      ${"FunctionDeclaration"} | ${[a, b]}      | ${[]}
      ${"VariableDeclaration"} | ${[a, module]} | ${[a]}
    `("returns the input if the type matches", async ({ type, input, expected }) => {
      expect(is(type)(input)).toEqual(expected);
    });
  });

  describe("flat", () => {
    test.each`
      input              | expected
      ${[a, b, c]}       | ${[a, b, c]}
      ${[[a], [b], [c]]} | ${[a, b, c]}
      ${[[a, b], [c]]}   | ${[a, b, c]}
      ${[[a], b, c]}     | ${[a, b, c]}
    `("flattens the input", async ({ input, expected }) => {
      expect(flat()(input)).toEqual(expected);
    });
  });

  describe("parent", async () => {
    const nestedModule = await parse(`
      function foo() {
        for (let i = 0; i < 10; i++) {
          if (i % 2 === 0) {
            console.log(i);
          }
        }
      }
    `);

    const forStatement = (nestedModule as any).body[0].body.stmts[0];
    const ifStatement = (nestedModule as any).body[0].body.stmts[0].body.stmts[0];
    const ifBlock = (nestedModule as any).body[0].body.stmts[0].body.stmts[0].consequent;
    const consoleLog = (nestedModule as any).body[0].body.stmts[0].body.stmts[0].consequent.stmts[0].expression;
    const consoleLogDirectParent = (nestedModule as any).body[0].body.stmts[0].body.stmts[0].consequent.stmts[0];

    test("we got the right ast node for testing", async () => {
      expect(consoleLog.type).toBe("CallExpression");
      expect(consoleLog.callee.object.value).toBe("console");
    });

    test("returns undefined if the input is undefined", async () => {
      expect(parent(nestedModule, { type: "BlockStatement" })(undefined)).toEqual(undefined);
    });

    test("returns the direct parent if the query is undefined", async () => {
      expect(parent(nestedModule, undefined)(consoleLog)).toEqual(consoleLogDirectParent);
    });

    test.each`
      query                         | input         | expected
      ${{ type: "WhileStatement" }} | ${consoleLog} | ${undefined}
      ${{ type: "BlockStatement" }} | ${consoleLog} | ${ifBlock}
      ${{ type: "IfStatement" }}    | ${consoleLog} | ${ifStatement}
      ${{ type: "ForStatement" }}   | ${consoleLog} | ${forStatement}
    `("returns the first parent matching the query", async ({ query, input, expected }) => {
      expect(parent(nestedModule, query)(input)).toBe(expected);
    });

    test.each`
      query                         | input                       | expected
      ${{ type: "WhileStatement" }} | ${[consoleLog, consoleLog]} | ${[undefined, undefined]}
      ${{ type: "BlockStatement" }} | ${[consoleLog, consoleLog]} | ${[ifBlock, ifBlock]}
      ${{ type: "IfStatement" }}    | ${[consoleLog, consoleLog]} | ${[ifStatement, ifStatement]}
      ${{ type: "ForStatement" }}   | ${[consoleLog, consoleLog]} | ${[forStatement, forStatement]}
    `("returns the all parents matching the query if the input is an array", async ({ query, input, expected }) => {
      expect(parent(nestedModule, query)(input)).toEqual(expected);
    });
  });
});
