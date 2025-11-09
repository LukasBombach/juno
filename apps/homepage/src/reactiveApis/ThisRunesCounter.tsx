export function Counter() {
  this.$.count = 1;

  const increment = () => {
    this.$.count++;
  };

  return <button onClick={increment}>Clicks: {this.$.count}</button>;
}
