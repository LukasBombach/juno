import { describe, it, expect } from "vitest";
import { parse } from "juno-ast/parse";
import { findAll } from "./pipeReboot";

describe("pipeReboot", () => {
  describe("findAll", () => {
    it("should find all nodes matching the query in a single node", async () => {
      const module = await parse(`const a = 1; const b = 2; let c = 3;`);

      expect(findAll({ type: "VariableDeclaration" })(module)).toHaveLength(3);

      expect(findAll({ type: "VariableDeclaration", kind: "const" })(module)).toHaveLength(2);

      expect(findAll({ type: "VariableDeclaration", declarations: [{ id: { value: "a" } }] })(module)).toHaveLength(1);

      expect(findAll({ type: "VariableDeclaration", declarations: [{ id: { value: /[a-z]/ } }] })(module)).toHaveLength(
        3
      );
    });

    /* it("should find all nodes matching the query in an array of nodes", () => {
      const nodes: Node[] = [
        {
          type: "Module",
          body: [
            { type: "Identifier", name: "a" },
            { type: "Identifier", name: "b" },
          ],
        },
        {
          type: "Module",
          body: [
            { type: "Identifier", name: "c" },
            { type: "Identifier", name: "a" },
          ],
        },
      ];

      const result = findAll({ type: "Identifier", name: "a" })(nodes);
      expect(result).toEqual([[{ type: "Identifier", name: "a" }], [{ type: "Identifier", name: "a" }]]);
    });

    it("should return an empty array if no nodes match the query", () => {
      const node: Node = {
        type: "Module",
        body: [
          { type: "Identifier", name: "a" },
          { type: "Identifier", name: "b" },
        ],
      };

      const result = findAll({ type: "Identifier", name: "c" })(node);
      expect(result).toEqual([]);
    }); */
  });
});
