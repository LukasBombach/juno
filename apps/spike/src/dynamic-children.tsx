import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

import type { FC } from "react";

const jsx: any = null;

const length = Math.floor(Math.random() * 10) + 1;
const randomLengthArray = Array.from({ length }, (_, i) => i + 1);

const RandomDivs: FC = () => {
  return (
    <>
      {randomLengthArray.map(i => (
        <div key={i} />
      ))}
    </>
  );
};

export default function DynamicChildren() {
  const count = signal(1);

  return (
    <Page title="Dynamic Children vs Path vs Hydraition">
      <RandomDivs />
      <button onClick={() => count.set(count() + 1)}>Clicked {count()}</button>
    </Page>
  );
}

function DynamicChildrenClient() {
  const count = signal(1);

  return [{ id: 169, events: { click: () => count.set(count() + 1) }, children: [8, () => count()] }];
}

function DynamicChildrenServer() {
  const count = signal(1);

  return jsx(Page, { title: "Dynamic Children vs Path vs Hydraition" }, [
    jsx(RandomDivs, {}),
    jsx("button", { onClick: () => count.set(count() + 1) }, `Clicked ${count()}`),
  ]);
}

const serverResult = `
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - juno</title>
      </head>
      <body>
        <ListOfExamples />
        <main>
          <div />
          <div />
          <div />
          <div />
          <button>Clicked 1</button>
          <script type="juno/hydrate" id="juno-hydrate-169"></script>
        </main>
      </body>
    </html>
`;
