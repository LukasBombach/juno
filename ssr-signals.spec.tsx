import { expect, test } from "bun:test";
import * as maverick from "@maverick-js/signals";

function signal<T>(id: number, initialValue: T): maverick.WriteSignal<T> {
  const s = maverick.signal(initialValue);
  return s;
}

const Add1 = (props: { value: number }) => {
  const a = signal(0, props.value);
  a.set(a() + 1);
  return <p>{a().toString()}</p>;
};

test("x", () => {
  expect(Add1({ value: 1 })).toEqual(<p>2</p>);
});
