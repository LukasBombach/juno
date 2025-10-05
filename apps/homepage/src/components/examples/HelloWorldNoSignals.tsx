export function HelloWorld() {
  let name = "world";
  let count = 0;

  return (
    <div>
      <h1>Hello {name}!</h1>
      <input onInput={e => (name = e.currentTarget.value)} />
      <button onClick={() => count++}>clicks: {count}</button>
    </div>
  );
}
