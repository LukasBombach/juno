import { signal } from "@maverick-js/signals";
import { Html } from "./components/Html";

export default function Page() {
  const count = signal(1);

  return (
    <Html title="Reactive Assignments">
      <button onClick={() => count.set(count() + 1)}>
        Clicked {count()} {count() === 1 ? "time" : "times"}
      </button>
      <script type="module">
        {`
          import { hydrate } from "@juno/client";
          import Page from "/src/reactive-assignments.tsx";

          console.debug(Page.toString());

          hydrate(document.body, Page());
        `}
      </script>
    </Html>
  );
}
