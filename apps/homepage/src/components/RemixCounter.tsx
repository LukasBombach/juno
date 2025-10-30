export function Counter() {
  let count = 1;

  const increment = () => {
    count++;
    this.update();
  };

  return <button onClick={increment}>Clicks: {count}</button>;
}
