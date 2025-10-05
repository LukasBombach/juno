import { signal } from "@maverick-js/signals";

export function HelloWorld() {
  const name = signal("world");
  const count = signal(0);

  return (
    <div>
      <h1>Hello {name()}!</h1>
      <input value={name()} onInput={e => name.set(e.currentTarget.value)} />
      <button onClick={() => count.set(count() + 1)}>clicks: {count()}</button>
    </div>
  );
}
