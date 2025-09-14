import { signal } from "@maverick-js/signals";

export function Counter(props: { className?: string } = {}) {
  const count = signal(1);

  return (
    <button onClick={() => count.set(count() + 1)} className={props.className}>
      Clicked {count()} {count() === 1 ? "time" : "times"}
    </button>
  );
}
