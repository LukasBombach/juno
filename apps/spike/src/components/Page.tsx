import { ListOfExamples } from "./ListOfExamples";

import type { FC, ReactNode } from "react";

export const Page: FC<{ children?: ReactNode; title?: string }> = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - juno</title>
      </head>
      <body>
        <ListOfExamples />
        <main>{props.children}</main>
      </body>
    </html>
  );
};
