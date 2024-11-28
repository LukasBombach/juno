import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

import type { FC } from "react";

const Step1: FC = () => (
  <section>
    <p>Lots of static JSX</p>
    <p>Things that would not show up in the JS bundle</p>
    <p>The only problem is</p>
    <p>that this JSX must be rendered with JavaScript</p>
  </section>
);

const Step2: FC = () => (
  <section>
    <p>because it will be swapped in the client</p>
    <p>so the template code for this needs to be</p>
    <p>available in some form to render to the page</p>
  </section>
);

export default function ConditionalChildrenWithLotsOfJsx() {
  const step = signal(1);

  const next = () => step.set(step() + 1);
  const prev = () => step.set(step() - 1);

  return (
    <Page title="Conditional Children with lots of JSX">
      {step() === 1 ? <Step1 /> : <Step2 />}
      <button onClick={next}>Prev</button>
      <button onClick={prev}>Next</button>
    </Page>
  );
}
