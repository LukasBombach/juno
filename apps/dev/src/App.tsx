import fs from "node:fs";

import type { FC, ReactNode } from "react";

function getExamples(): [string, string][] {
  return fs
    .readdirSync(process.cwd() + "/src")
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => ["/" + file.replace(/\.tsx$/, ""), file.replace(/_/g, " ").replace(/\.tsx$/, "")]);
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
      <body className="bg-one-dark text-white grid grid-cols-[1fr_400px_800px_1fr] gap-16 py-24">
        <nav className="col-start-2 col-span-1">
          <ul>
            {examples.map(([path, name]) => (
              <li key={path}>
                <a href={path}>{name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-start-3 col-span-1">{props.children}</main>
      </body>
    </html>
  );
};

export default App;
