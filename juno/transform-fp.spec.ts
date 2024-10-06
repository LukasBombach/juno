import { describe, test, expect } from "vitest";
import { transformToClientCode } from "./transform-fp";

describe("transformToClientCode", () => {
  test("transforms signal() calls", async () => {
    await expect(
      transformToClientCode(`
      export function App(ctx) {
        ctx.signal("a");
        ctx.signal("b");
      }
    `)
    ).resolves.toMatchInlineSnapshot(`
      "export function App(ctx) {
          ctx.signal(ctx.ssrData[0]);
          ctx.signal(ctx.ssrData[1]);
      }"
    `);
  });
});
