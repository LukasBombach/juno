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
    <script type="juno/data">{ component: "Counter", state: [5] }</script>
  </div>
`;

const expectedHydrationJs = `
  const Counter = () => 
`;

export default function (program: Program) {}
