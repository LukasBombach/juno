import { fragment } from "juno";

export function Counter() {
  const button = fragment(({ count }: { count: number }) => (
    <button onClick={handleClick}>Number of clicks: {count}</button>
  ));

  const handleClick = () => button.count++;

  return button;
}
