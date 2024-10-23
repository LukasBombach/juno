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

  test("transforms return statements", async () => {
    await expect(
      transformToClientCode(`
      function App(ctx) {
        const message = "Hello";
        return (
          <main>
            <p>{message}</p>
            <button onClick={() => console.log(message)} />
          </main>
        );
      }`),
    ).resolves.toMatchInlineSnapshot(`
      "function App(ctx) {
          const message = "Hello";
          return [{ path: [1, 1], onClick: () => console.log(message) }];
      }
      "
    `);
  });
});
