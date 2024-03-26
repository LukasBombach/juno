## Input

```jsx
const Counter = () => {
  let count = Math.round(Math.random() * 1000);
  return (
    <>
      <label>{count}</label>
      <button onClick={() => count++}>Click</button>
    </>
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
  <label>23</label>
  <button>Click</button>
  <script type="juno/component" juno-id="1"></script>
  <hr />
  <label>5</label>
  <button>Click</button>
  <script type="juno/component" juno-id="2"></script>
</div>
```

## Server JS

```js
import { el } from "juno/server";
import { signal } from "@maverick-js/signals";

const Counter = () => {
  const count = signal(Math.round(Math.random() * 1000));

  return (
    <>
      <label>{count}</label>
      <button onClick={() => count++}>Click</button>
    </>
  );
};
```
