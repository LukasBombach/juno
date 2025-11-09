import { signal } from "@preact/signals-core";

export function Counter(props: { className?: string } = {}) {
  const count = signal(1);

  return (
    <button onClick={() => count.value++} className={props.className}>
      Clicked {count.value} {count.value === 1 ? "time" : "times"}
    </button>
  );
}
