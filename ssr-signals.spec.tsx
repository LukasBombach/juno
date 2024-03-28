import { expect, test } from "bun:test";
import * as maverick from "@maverick-js/signals";

function signal<T>(id: number, initialValue: T): maverick.WriteSignal<T> {
  const s = maverick.signal(initialValue);
  return s;
}

const Add1 = (props: { val: number }) => {
  const a = signal(0, props.val);
  return <p>{a().toString()}</p>;
};

test("x", () => {
  expect(Add1({ val: 1 })).toEqual(<p>1</p>);
});
