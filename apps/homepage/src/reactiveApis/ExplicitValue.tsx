import { value } from "juno";

export function Counter(props: { className?: string } = {}) {
  const count = value(1);

  return (
    <button onClick={() => count.set(count.get() + 1)} className={props.className}>
      Number of Clicks {count.get()}
    </button>
  );
}
