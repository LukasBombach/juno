export function Counter(props: { className?: string } = {}) {
  let count = 1;

  return (
    <button onClick={() => count++} className={props.className}>
      Clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );
}
