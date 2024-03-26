```jsx
// Input

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
```

```js
// Server JS

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
