import { describe, test, expect } from "vitest";
import { transformToClientCode } from "./transform-fp";

describe("transformToClientCode", () => {
  test("transforms signal() calls", async () => {
    await expect(
      transformToClientCode(`
      export function App(ctx) {
        ctx.signal("a");
      }
    `)
    ).resolves.toMatchInlineSnapshot(`
      "export function App(ctx) {
          ctx.signal(ctx.ssrData[0]);
      }"
    `);
  });
});
