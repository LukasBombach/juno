```javascript
const Counter = () => {
  const [count, setCount] = useState(0);
  setCount(Math.round(Math.random() * 1000));
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

const App = () => (
  el("div", {},
    el(Counter),
    el("hr"),
    el(Counter),
  );
);

const [html, states] = render(App);

function render(component) {
  const states = [];
  const html = component();
  return [states, html];
}
```

```html
<div>
  <button j:0:0>23</button>
  <hr />
  <button j:1:0>5</button>
</div>
```

<!--   <div>
    <Counter />
    <hr />
    <Counter />
  </div> -->
