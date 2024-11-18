import { signal } from "@maverick-js/signals";

export default function Page() {
  const count = signal(1);

  function handleClick() {
    count.set(count() + 1);
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>juno</title>
      </head>
      <body>
        <button onClick={handleClick}>
          Clicked {count()} {count() === 1 ? "time" : "times"}
        </button>
        <script type="module">
          {`
          import { hydrate } from "@juno/client";
          import Page from "/src/reactive-assignments.tsx";

          console.debug(Page.toString());

          hydrate(document, Page());
          `}
        </script>
      </body>
    </html>
  );
}
