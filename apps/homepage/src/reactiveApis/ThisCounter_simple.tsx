export function Counter(this: { count: number }) {
  this.count = 1;

  return <button onClick={() => this.count++}>Clicks: {this.count}</button>;
}
