import { createSignal } from "juno";

export function Counter() {
  const [count, setCount] = createSignal(1);

  const increment = () => {
    setCount(n => n + 1);
  };

  return <button onClick={increment}>Clicks: {count()}</button>;
}
