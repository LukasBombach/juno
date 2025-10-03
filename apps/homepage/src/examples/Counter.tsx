import { signal, effect } from "@maverick-js/signals";

function SomeTextInside() {
  return <span>Julia ist lieP</span>;
}

export function Counter(props: { className?: string } = {}) {
  const count = signal(1);

  // effect(() => console.log("clicked", count(), count() === 1 ? "time" : "times"));

  return (
    <button onClick={() => count.set(count() + 1)} className={props.className}>
      Clicked {count()} {count() === 1 ? "time" : "times"}
    </button>
  );
}
