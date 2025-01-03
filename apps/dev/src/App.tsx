import fs from "node:fs";

import type { FC, ReactNode } from "react";

function getExamples(): [string, string][] {
  return fs
    .readdirSync(process.cwd() + "/src")
    .filter((file) => file !== "App.tsx")
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""))
    .map((file) => ["/" + file, file.replace(/_/g, " ")]);
}

const App: FC<{ children?: ReactNode; title?: string }> = (props) => {
  const examples = getExamples();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/src/tailwind.css" />
        <title>{props.title} - juno</title>
      </head>
      <body className="bg-zinc-900 text-white grid grid-rows-[80px_1fr] grid-cols-[400px_1fr] w-screen h-screen">
        <header className="row-start-1 row-span-1 col-span-full bg-zinc-800 grid content-center px-8">
          <h1 className="text-2xl font-medium">juno</h1>
        </header>
        <nav className="row-start-2 col-span-1 p-8">
          <ul>
            {examples.map(([path, name]) => (
              <li key={path}>
                <a href={path}>{name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <main className="row-start-2 col-start-2 col-span-1">{props.children}</main>
      </body>
    </html>
  );
};

export default App;
