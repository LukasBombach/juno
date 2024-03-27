## Input

```jsx
const Counter = () => {
  let count = Math.floor(Math.random() * 100);
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

## Server JS

```js
import { el } from "juno/server";
import { signal } from "@maverick-js/signals";

const Counter = () => {
  const count = signal(0, Math.round(Math.random() * 1000));
  return el(
    "section",
    {},
    el("label", {}, count()),
    el("hr"),
    el("button", { onClick: () => count.set(count() + 1) }, "Click")
  );
};
```

## Generated HTML

```html
<div>
  <script type="juno/component" juno-id="1"></script>
  <label>23</label>
  <button>Click</button>
  <hr />
  <script type="juno/component" juno-id="2"></script>
  <label>5</label>
  <button>Click</button>
</div>
```

## Client JS

```js
const data = [
  { id: 1, selectors: ["*:nth-child(1) > *:nth-child(1)", "*:nth-child(1) > *:nth-child(2)"], data: [23] },
  { id: 2, selectors: ["*:nth-child(1) > *:nth-child(1)", "*:nth-child(1) > *:nth-child(2)"], data: [5] },
];

const Counter = dataFromSSR => {
  const count = signal(dataFromSSR[0]);
  return [{ children: [count] }, { onClick: () => count.set(count() + 1) }];
};

function hydrate(id, component, selectors, dataFromSSR) {
  const marker = document.querySelector('script[juno-id="${id}"]');
  const elements = selectors.map(selector => marker.querySelector(selector));
  const functionality = component(dataFromSSR);
  apply(functionality, elements);
}
```
