import { state, effect, on, addListener } from "juno";

export function Counter() {
  let count = state(1);

  const increment = () => {
    count++;
  };

  effect(() => (document.title = `Clicks: ${count}`));

  on(count, () => (document.title = `Clicks: ${count}`));

  addListener(count, () => (document.title = `Clicks: ${count}`));

  return <button onClick={increment}>Clicks: {count}</button>;
}
