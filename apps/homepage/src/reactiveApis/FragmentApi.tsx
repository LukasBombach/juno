import { fragment } from "juno";

interface ButtonProps {
  count: number;
}

export function Counter() {
  const handleClick = () => button.count++;

  const button = fragment(({ count = 0 }) => (
    <button onClick={handleClick}>
      Clicked {count} {count === 1 ? "time" : "times"}
    </button>
  ));

  return button;
}
