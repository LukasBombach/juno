import { expect, test } from "bun:test";
import * as maverick from "@maverick-js/signals";

function signal<T>(id: number, initialValue: T): maverick.WriteSignal<T> {
  const s = maverick.signal(initialValue);
  return s;
}

function el(element: string, props?: Record<string, unknown>, ...children: unknown[]) {}

const Counter = async () => {
  const a = await Promise.resolve(signal(0, "A"));

  const b = signal(0, "B");

  return (
    <main>
      <p>{a()}</p>
      <p>{b()}</p>
    </main>
  );
};

console.log(await Counter());

test("2 + 2", () => {
  expect(2 + 2).toBe(4);
});
