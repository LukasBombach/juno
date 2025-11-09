export function Counter() {
  const button = ({ count = 0 }) => (
    <button onClick={() => button.count++}>
      Clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );

  return button;
}
