import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

import type { FC } from "react";

const BunchOfDivs: FC = () => (
  <>
    <div>Div 1</div>
    <div>Div 2</div>
    <div>Div 3</div>
    <div>Div 4</div>
    <div>Div 5</div>
    <div>Div 6</div>
    <div>Div 7</div>
    <div>Div 8</div>
    <div>Div 9</div>
    <div>Div 10</div>
  </>
);

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

export default function ReactiveAssignments() {
  const count = signal(1);

  return (
    <Page title="Nested Children vs Path">
      <BunchOfDivs />
      <DynamicDivs />
      <button onClick={() => count.set(count() + 1)}>
        Clicked {count()} {count() === 1 ? "time" : "times"}
      </button>
    </Page>
  );
}
