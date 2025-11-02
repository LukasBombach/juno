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

export const CounterTemplate = `
  <button>
    Clicked <slot name="1"></slot> <slot name="2"></slot>
  </button>
  <script type="text/juno-template" c="a0ef"></script>
`;

export const CounterTemplate2 = `
  <juno-component c="a0ef">
    <button>
      Clicked <slot name="1"></slot> <slot name="2"></slot>
    </button>
  </juno-component>
`;
