import { describe, test, expect } from "vitest";
import { transformToClientCode } from "./transform-fp";

describe("transformToClientCode", () => {
  test("transforms signal() calls", async () => {
    await expect(
      transformToClientCode(`
      export function App(ctx) {
        ctx.signal("a");
        ctx.signal("b");
      }`),
    ).resolves.toMatchInlineSnapshot(`
      "export function App(ctx) {
          ctx.signal(ctx.ssrData[0]);
          ctx.signal(ctx.ssrData[1]);
      }
      "
    `);
  });

  test("transforms return statements", async () => {
    await expect(
      transformToClientCode(`
      export function App(ctx) {
        const message = "Hello";
        return <button onClick={() => console.log(message)}></button>;
      }`),
    ).resolves.toMatchInlineSnapshot(`
      "export function App(ctx) {
          const message = "Hello";
          return [];
      }
      "
    `);
  });
});
