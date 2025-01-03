import { ListOfExamples } from "./ListOfExamples";

import type { FC, ReactNode } from "react";

export const Page: FC<{ children?: ReactNode; title?: string }> = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/src/tailwind.css" />
        <title>{props.title} - juno</title>
      </head>
      <body>
        <div className="container mx-auto px-4 grid grid-cols-[400px_1fr] gap-4">
          <nav>
            <ListOfExamples />
          </nav>
          <main>{props.children}</main>
        </div>
      </body>
    </html>
  );
};
