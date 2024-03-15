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
    <p>count: 5</p>
    <button>click</button>
    <script type="juno/component">{ component: "Counter", state: [5] }</script>
  </div>
`;

const expectedClientJs = `
  const Counter = () => {
    const [count, setCount] = useState(getSsrCtx().componentState[0]);

    return [
      [prev(2).text(7,1), [count]],
      [prev(1), [{ on: "click", () => setCount(count + 1) }]]
    ];
  }

  juno.queryComponents().forEach((script, { component, state }) => {
    
  })
`;

export default function (program: Program) {}
