import { signal } from "@preact/signals-core";

export function Counter(props: { className?: string } = {}) {
  const count = signal(1);

  return [
    {
      onClick: () => count.value++,
      className: props.className,
      children: [() => count.value, () => (count.value === 1 ? "time" : "times")],
    },
  ];
}
Counter.id = "a0ef";

export function Counter2(props: { className?: string } = {}) {
  const count = signal(1);

  return [
    [
      ["click", () => count.value++],
      ["className", props.className],
      [() => count.value, () => (count.value === 1 ? "time" : "times")],
    ],
  ];
}
Counter2.id = "a0ef";

export function Counter3(props: { className?: string } = {}) {
  const count = signal(1);

  return [
    {
      events: {
        click: () => count.value++,
      },
      props: {
        className: props.className,
      },
      children: [() => count.value, () => (count.value === 1 ? "time" : "times")],
    },
  ];
}
Counter3.id = "a0ef";

export const CounterTemplate = `
  <button data-juno-element-id="a0ef-1">
    Clicked <slot name="1"></slot> <slot name="2"></slot>
  </button>
`;
