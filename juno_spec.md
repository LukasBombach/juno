```ts
import { signal } from "@maverickjs/signals";
import type { Signal } from "@maverickjs/signals";

interface Instance {
  signals: Signal[];
}

interface Context {
  instances: Instance[];
  current: Instance;
}

function serverRuntime() {
  const ctx: Context = {
    instances: [];
    current = { signals: [] };
  }

  function el(comp, props, ...children) {
    if (isFunction(comp)) {
      // todo when we go async, ctx.current might
      // todo not hold the currenly executing component
      // todo we need to inject the instance here or something
      ctx.current = { signals: [] };
      instances.push(ctx.current);
      comp();
    }
  }

  function useSignal<T>(initial: T) {
    const signal = signal(inital)
    ctx.current.signals.push(signal);
    return signal;
  }

  function render(component) {
    const html = component();
    return [signals, html];
  }

  return {
    el,
    useSignal,
    render,
  };
}
```

```javascript
const { useSignal, el, render } = serverRuntime();

const Counter = () => {
  const [count, setCount] = useSignal(0);
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

const [html, instances] = render(App);
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
