import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

import type { FC } from "react";

const length = Math.floor(Math.random() * 10) + 1;
const randomLengthArray = Array.from({ length }, (_, i) => i + 1);

const RandomDivs: FC = () => {
  return (
    <>
      {randomLengthArray.map((i) => (
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
