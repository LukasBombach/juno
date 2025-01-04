import fs from "node:fs";
import { signal } from "@maverick-js/signals";

import type { FC } from "react";

function getExamples(): [string, string][] {
  return fs
    .readdirSync(process.cwd() + "/src/examples")
    .filter((file) => file !== "App.tsx")
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""))
    .map((file) => ["/" + file, file.replace(/_/g, " ")]);
}

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

const LoadExample: FC<{ path: string | null }> = ({ path }) => {
  return path;
};

const App: FC = () => {
  const examples = getExamples();
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
            {examples.map(([path, name]) => (
              <li key={path}>
                <button onClick={() => selectedExample.set(path)}>{name}</button>
              </li>
            ))}
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
