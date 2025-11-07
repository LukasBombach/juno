import { signal } from "@preact/signals-core";

export function Counter() {
  const count = signal(1);

  return (
    <button onClick={() => count.value++}>
      Clicked {count.value} {count.value === 1 ? "time" : "times"}
    </button>
  );
}

export function CounterHydration() {
  const count = signal(1);

  return [
    {
      onClick: () => count.value++,
      children: [() => count.value, () => (count.value === 1 ? "time" : "times")],
    },
  ];
}

export function CounterTemplate() {
  return `
    <button>
      Clicked <slot name="1"></slot> <slot name="2"></slot>
    </button>
  `;
}
