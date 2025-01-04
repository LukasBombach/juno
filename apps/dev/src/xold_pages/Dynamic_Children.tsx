import { signal } from "@maverick-js/signals";
import { Page } from "./components/Page";

export default function DynamicChildren() {
  const count = signal(1);

  const length = Math.floor(Math.random() * 10) + 1;
  const randomLengthArray = Array.from({ length }, (_, i) => i + 1);

  return (
    <Page title="Dynamic Children vs Path vs Hydraition">
      {randomLengthArray.map((i) => (
        <span key={i}>{i}</span>
      ))}
      <br />
      <button onClick={() => count.set(count() + 1)}>
        Clicked {count()} {count() === 1 ? "time" : "times"}
      </button>
      <script type="module">
        {`
          import { hydrate } from "@juno/hydrate";
          import Page from "/src/2._Dynamic_Children.tsx";

          console.debug(Page.toString());

          hydrate(document.querySelector("main"), Page());
        `}
      </script>
    </Page>
  );
}
