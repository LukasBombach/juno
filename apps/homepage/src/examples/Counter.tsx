import { signal } from "@maverick-js/signals";

export function Counter() {
  const count = signal(1);

  return (
    <button onClick={() => count.set(count() + 1)}>
      Clicked {count()} {count() === 1 ? "time" : "times"}
    </button>
  );
}
