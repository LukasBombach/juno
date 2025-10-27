import { signal } from "@preact/signals-core";

function SomeTextInside() {
  return <span>Julia ist lieP</span>;
}

export function Counter(props: { className?: string } = {}) {
  let button: HTMLButtonElement | null = null;
  let count = 1;

  function setButton(el: HTMLButtonElement | null) {
    button = el;
  }

  function update() {
    if (button) {
      count++;
      button.textContent = `Clicked ${count} times`;
    }
  }

  return (
    <button className={props.className} ref={setButton} onClick={update}>
      Clicked 1 time
    </button>
  );
}
