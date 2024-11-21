import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

export default function ReactiveAssignments() {
  const count = signal(1);

  return (
    <Page title="Reactive Assignments">
      <div id="example">
        <button onClick={() => count.set(count() + 1)}>
          Clicked {count()} {count() === 1 ? "time" : "times"}
        </button>
      </div>
      <script type="module">
        {`
          import { hydrate } from "@juno/client";
          import Page from "/src/reactive-assignments.tsx";

          console.debug(Page.toString());

          hydrate(document.querySelector("#example"), Page());
        `}
      </script>
    </Page>
  );
}
