export default function App() {
  let clicks = 0;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width" />
        <title>juno</title>
      </head>
      <body>
        <h1>hello world</h1>
        <button onClick={() => console.log("Button clicked", ++clicks)}>Click me</button>
      </body>
    </html>
  );
}
