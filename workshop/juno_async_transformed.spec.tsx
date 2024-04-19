const Counter = () => {
  const count = useSignal(0);
  count.set(Math.round(Math.random() * 1000));
  return [
    <main>
      <label>{count()}</label>
      <button onClick={() => count.set(count() + 1)}>Click</button>
    </main>,
    [count],
  ];
};

const [html, states] = render(Counter);

function render(component) {
  const [vdom, states] = component();
}
