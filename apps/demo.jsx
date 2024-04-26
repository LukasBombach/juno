function Counter() {
  let count = Math.floor(Math.random() * 100);

  return (
    <section>
      <button onClick={() => count++}>Click</button>
      <label>
        Count: {count}, yes {count}!
      </label>
    </section>
  );
}

export default function DemoPage() {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>juno</title>
      </head>
      <body>
        <h1>hello juno</h1>
        <Counter />
        <Counter />
      </body>
    </html>
  );
}
