import fs from "node:fs";

import type { FC, ReactNode } from "react";

function getPages(): string[] {
  return fs
    .readdirSync(process.cwd() + "/src")
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""));
}

export const Page: FC<{ children?: ReactNode; title?: string }> = (props) => {
  const pages = getPages();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - juno</title>
      </head>
      <body>
        <nav>
          <ul>
            {pages.map((name) => (
              <li key={name}>
                <a href={`/${name}`}>{name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <main>{props.children}</main>
      </body>
    </html>
  );
};
