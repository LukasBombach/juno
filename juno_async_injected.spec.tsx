const Counter = ctx => {
  const [count, setCount] = ctx.useSignal(0);
  setCount(Math.round(Math.random() * 1000));
  return (
    <main>
      <label>{count}</label>
      <button onClick={() => setCount(count + 1)}>Click</button>
    </main>
  );
};

const [html, state] = render(Counter);

function render(component) {
  const ctx = { useState };
  const vdom = component(ctx);
}
