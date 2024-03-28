import { expect, test } from "bun:test";
import { signal } from "@maverick-js/signals";
import type { WriteSignal } from "@maverick-js/signals";

const Add1 = (props: { val: number }): [JSX.Element, ...WriteSignal<any>[]] => {
  const a = signal(props.val);
  return [<p>{a()}</p>, a];
};

test("x", () => {
  const [vdom, ...signals] = Add1({ val: 1 });
  expect(vdom).toEqual(<p>{1}</p>);
  expect(signals[0]()).toBe(1);
});
