import * as maverick from "@maverick-js/signals";

function signal<T>(id: number, initialValue: T): maverick.WriteSignal<T> {
  const s = maverick.signal(initialValue);
  return s;
}

function el(element: string, props?: Record<string, unknown>, ...children: unknown[]) {}

const Counter = async () => {
  const count = signal(0, Math.round(Math.random() * 100));
  return el(
    "section",
    {},
    el("label", {}, count()),
    el("hr"),
    el("button", { onClick: () => count.set(count() + 1) }, "Click")
  );
};
