const input = `
  const Counter = () => {
    const [count, setCount] = useState(0)

    setCount(5);

    return (
      <p>count: {count}</p>
      <button onClick={() => setCount(count + 1)}>click</button>
    )
  }

  export default App = () => {
    return (
      <div>
        <Counter />
      </div>
    )
  }
`;

const expectedServerJs = `
  const Counter = () => {
    const [count, setCount] = useState(0)

    setCount(5);

    return (
      juno.el("p", { "j:0:0": true }, "count: ", count),
      juno.el("button", { onClick: () => setCount(count + 1), "j:0:1": true }, "click")
    );
  }

  const App = () => {
    return (
      juno.el("div", null, juno.el(Counter, null))
    )
  }

  const serverRenderedHtml = juno.renderToString(juno.el(App, null));
`;

const expectedRenderedHtml = `
  <div>
    <p j:0:0>count: 5</p>
    <button j:0:1>click</button>
  </div>
`;

const expectedClientJs = `
  const Counter = (ssrState) => {
    const [count, setCount] = useState(ssrState[0]);

    return [
      [{ type: "text", span: [7, 1], value: count }],
      [{ type: "event", name: "click", value: () => setCount(count + 1) }]
    ];
  }

  const data = [
    [Counter, ['j:0:0', 'j:0:1'], [5]]
  ];

  data.forEach(([component, selectors, state]) => {
    component(state).forEach((props, i) => juno.hydrate(selectors[i], props));
  });
`;

export default function (program: Program) {}
