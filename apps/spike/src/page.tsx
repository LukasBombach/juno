import { signal } from "@maverick-js/signals";

export default function Page() {
  const count = signal(Math.floor(Math.random() * 100));

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>juno</title>
      </head>
      <body>
        <h1>hello juno</h1>
        <p>{count()}</p>
        <button onClick={() => count.set(count() + 1)}>Click</button>
        <script type="module" src="/src/client.tsx"></script>
      </body>
    </html>
  );
}
