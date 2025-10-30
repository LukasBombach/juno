export function Counter() {
  this.state.count = 1;

  const increment = () => {
    this.state.count++;
  };

  return <button onClick={increment}>Clicks: {this.state.count}</button>;
}
