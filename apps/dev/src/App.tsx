import { signal } from "@maverick-js/signals";

import type { FC } from "react";

const Hydrate: FC<{ path: string }> = ({ path }) => {
  return (
    <script type="module">
      {`
        import { hydrate } from "@juno/hydrate";
        import Page from "/src/${path}.tsx";
        console.debug(Page.toString());
        hydrate(document.querySelector("main"), Page());
      `}
    </script>
  );
};

const LoadExample: FC<{ path: string | null; titleOrSomething?: string }> = ({ path, titleOrSomething }) => {
  return (
    <section>
      <h3>{titleOrSomething}</h3>
      {/*there should be no marker here because there is no reactivity */}
      <p>The path is {path}</p>
      {/* <script
        data-type="juno/h"
        data-comment="marker should be here because a reactive var is coming in from the props"
      /> */}
    </section>
  );
};

const App: FC = () => {
  const selectedExample = signal<string | null>(null);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/src/tailwind.css" />
        <title>juno</title>
      </head>
      <body className="bg-zinc-900 text-white grid grid-rows-[80px_1fr] grid-cols-[400px_4px_1fr] w-screen h-screen">
        <header className="row-start-1 row-span-1 col-span-full bg-zinc-800 grid content-center px-8">
          <h1 className="text-2xl font-medium">juno</h1>
        </header>
        <nav className="row-start-2 col-span-1 p-8">
          <ul>
            <li>
              <button onClick={() => selectedExample.set("reactive_assignments")}>Reactive Assignments</button>
            </li>
          </ul>
        </nav>
        <hr className="row-start-2 col-span-1 bg-zinc-800 h-[calc(100%-theme(space.16))] rounded-full self-center border-none transition-colors hover:bg-zinc-600 cursor-grab" />
        <main className="row-start-2 col-start-3 col-span-1">
          <LoadExample path={selectedExample()} />
        </main>
        <Hydrate path="App" />
      </body>
    </html>
  );
};

export default App;
