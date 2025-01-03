import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

import type { FC } from "react";

const ChildA: FC = () => (
  <section>
    <p>Lots of static JSX</p>
    <p>Things that would not show up in the JS bundle</p>
    <p>The only problem is</p>
    <p>that this JSX must be rendered with JavaScript</p>
  </section>
);

const ChildB: FC = () => (
  <section>
    <p>because it will be swapped in the client</p>
    <p>so the template code for this needs to be</p>
    <p>available in some form to render to the page</p>
  </section>
);

export default function ConditionalChildrenWithLotsOfJsx() {
  const toggle = signal(true);

  const switchToggle = () => toggle.set(!toggle());

  return (
    <Page title="Conditional Children with lots of JSX">
      {toggle() ? <ChildA /> : <ChildB />}
      <button onClick={switchToggle}>Swtich</button>
    </Page>
  );
}
