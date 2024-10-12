import { describe, test, expect } from "vitest";
import { transformToClientCode } from "./transform-fp";

describe("transformToClientCode", () => {
  test("transforms signal() calls", async () => {
    await expect(
      transformToClientCode(`
      function App(ctx) {
        ctx.signal("a");
        ctx.signal("b");
      }`),
    ).resolves.toMatchInlineSnapshot(`
      "function App(ctx) {
          ctx.signal(ctx.ssrData[0]);
          ctx.signal(ctx.ssrData[1]);
      }
      "
    `);
  });

  test.only("transforms return statements", async () => {
    await expect(
      transformToClientCode(`
      function App(ctx) {
        const message = "Hello";
        return <button onClick={() => console.log(message)} />;
      }`),
    ).resolves.toMatchInlineSnapshot(`
      "function App(ctx) {
          const message = "Hello";
          return [];
      }
      "
    `);
  });
});
