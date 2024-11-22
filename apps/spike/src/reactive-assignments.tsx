import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

export default function ReactiveAssignments() {
  const count = signal(1);

  return (
    <Page title="Reactive Assignments">
      <button onClick={() => count.set(count() + 1)}>
        Clicked {count()} {count() === 1 ? "time" : "times"}
      </button>
      <script type="module">
        {`
          import { hydrate } from "@juno/client";
          import Page from "/src/reactive-assignments.tsx";

          console.debug(Page.toString());

          hydrate(document.querySelector("main"), Page());
        `}
      </script>
    </Page>
  );
}