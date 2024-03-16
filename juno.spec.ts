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

const expectedRenderedHtml = `
  <div>
    <p j:0:0>count: 5</p>
    <button j:0:1>click</button>
  </div>
`;

const expectedClientJs = `
  const Counter = () => {
    const [count, setCount] = useState(ssrState[0]);

    return [
      [{ type: "text", span: [7, 1], value: count }],
      [{ type: "event", name: "click", value: () => setCount(count + 1) }]
    ];
  }

  const data = [
    { component: Counter, state: [5]}
  ];

  data.forEach(({ component, state }, componentIndex) => {
    const ssrState = state;
    component().forEach((props, elementIndex) => {
      const element = document.querySelector(\`j:\${componentIndex}:\${componentIndex}\`);
      props.forEach(prop => {
        if (prop.type === "text") {
          // todo split tex at span etc
          element.textContent = prop.value;
        } else if (prop.type === "event") {
          element.addEventListener(prop.name, prop.value);
        }
      })
    });
  });
`;

export default function (program: Program) {}
