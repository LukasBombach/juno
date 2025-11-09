import { $ } from "juno";

export function Counter() {
  const state = $({ count: 0 });

  const handleClick = () => state.count++;

  return <button onClick={handleClick}>Number of clicks: {state.count}</button>;
}
