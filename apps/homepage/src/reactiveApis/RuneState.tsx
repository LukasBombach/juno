import { $ } from "juno";

export function Counter() {
  const props = $({ count: 0 });

  const handleClick = () => props.count++;

  return <button onClick={handleClick}>Number of clicks: {props.count}</button>;
}
