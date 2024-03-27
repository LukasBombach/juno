## Input

```jsx
const Counter = () => {
  let count = Math.round(Math.random() * 1000);
  return (
    <section>
      <label>{count}</label>
      <button onClick={() => count++}>Click</button>
    </section>
  );
};

const App = () => (
  <main>
    <Counter />
    <hr />
    <Counter />
  </main>
);

render(App);
```

## Generated HTML

```html
<div>
  <section juno-id="1">
    <label>23</label>
    <button>Click</button>
  </section>
  <hr />
  <section juno-id="2">
    <label>5</label>
    <button>Click</button>
  </section>
</div>
```

## Server JS

```js
import { el } from "juno/server";
import { signal } from "@maverick-js/signals";

const Counter = () => {
  const count = signal(Math.round(Math.random() * 1000));
  return [
    el(
      "section",
      {},
      el("label", {}, count()),
      el("hr"),
      el("button", { onClick: () => count.set(count() + 1) }, "Click")
    ),
    [count],
  ];
};
```
