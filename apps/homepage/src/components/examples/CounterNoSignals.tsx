export function Counter() {
  let count = 1;

  return (
    <button onClick={() => count++}>
      Clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );
}
