import { ui } from "juno";

export function Counter() {
  const props = ui({ count: 1 });

  const increment = () => {
    props.count++;
  };

  return <button onClick={increment}>Clicks: {props.count}</button>;
}
