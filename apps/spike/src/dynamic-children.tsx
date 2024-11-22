import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

import type { FC } from "react";

const DynamicDivs: FC = () => {
  const numDivs = Math.floor(Math.random() * 10) + 1;

  return (
    <>
      {Array.from({ length: numDivs }, (_, i) => (
        <div key={i}>Div {i + 1}</div>
      ))}
    </>
  );
};

export default function DynamicChildren() {
  const count = signal(1);

  return (
    <Page title="Dynamic Children vs Path vs Hydraition">
      <DynamicDivs />
      <button onClick={() => count.set(count() + 1)}>
        Clicked {count()} {count() === 1 ? "time" : "times"}
      </button>
    </Page>
  );
}
