export function Counter() {
  let count = $state(1);

  const increment = () => {
    count++;
  };

  return <button onClick={increment}>Clicks: {count}</button>;
}
