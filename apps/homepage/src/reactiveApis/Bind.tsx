import { bind } from "juno";

export function Counter(props: { className?: string } = {}) {
  const count = bind(1);

  return (
    <button onClick={() => count++} className={props.className}>
      Clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );
}
