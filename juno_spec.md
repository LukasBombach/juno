```javascript
function serverRuntime() {
  const states = [];

  function render(component) {
    const html = component();
    return [states, html];
  }

  function useState() {}

  function el() {}
}
```

```javascript
const { useState, el, render } = serverRuntime();

const Counter = () => {
  const [count, setCount] = useState(0);
  setCount(Math.round(Math.random() * 1000));
  return (
    <>
      <label>{count}</label>
      <button onClick={() => setCount(count + 1)}>Click</button>
    </>
  );
};

const App = () => (
  el("div", {},
    el(Counter),
    el("hr"),
    el(Counter),
  );
);

const [html, states] = render(App);
```

```html
<div>
  <label j:0:0>23</label>
  <button j:0:1>Click</button>
  <hr />
  <label j:1:0>5</label>
  <button j:1:1>Click</button>
</div>
```
