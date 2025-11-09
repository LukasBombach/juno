import { fragment } from "a-ui-library";

export function Counter(props: { className?: string } = {}) {
  const ui = fragment(({ count }: { count: number }) => (
    <button onClick={() => count++}>Number of clicks: {count}</button>
  ));

  return ui;
}
