import { signal } from "@preact/signals-core";

function SomeTextInside() {
  return <span>Julia ist lieP</span>;
}

export function Counter(props: { className?: string } = {}) {
  const count = signal(1);

  return (
    <button onClick={() => count.value++} className={props.className}>
      Clicked {count.value} {count.value === 1 ? "time" : "times"}
    </button>
  );
}
