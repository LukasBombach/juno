import { signal } from "@maverick-js/signals";

export default function ReactiveAssignments() {
  const count = signal(1);

  return (
    <button onClick={() => count.set(count() + 1)}>
      Clicked {count()} {count() === 1 ? "time" : "times"}
    </button>
  );
}
