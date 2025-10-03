import { signal } from "@maverick-js/signals";
import { Counter } from "./Counter";
import { Editor } from "./Editor";

const demos = [
  { title: "Hello World", code: `console.log('Hello, World!');` },
  {
    title: "Counter",
    code: `let count = 0;

const increment = () => {
  count++;
  console.log('Counter:', count);
};`,
  },
];

export function Playground() {
  const selectedDemo = signal(0);

  return (
    <div className="row-start-4 -row-end-2 col-start-2 -col-end-2 md:row-start-2 md:-row-end-2 md:col-start-4 md:-col-end-2 rounded-xl shadow-window grid grid-rows-1 grid-cols-[minmax(200px,14%)_1fr] overflow-hidden">
      <nav className="p-7 flex flex-col gap-2 bg-neutral-200/80 border-r-1 border-r-neutral-950/10 dark:bg-neutral-900/70">
        {demos.map((demo, index) => (
          <button
            onClick={() => selectedDemo.set(index)}
            className="text-sm cursor-pointer text-neutral-700 text-left hover:underline dark:text-neutral-100"
          >
            {demo.title}
          </button>
        ))}
        <Counter className="text-sm cursor-pointer text-neutral-700 text-left hover:underline dark:text-neutral-100" />
      </nav>
      <Editor
        value={demos[selectedDemo()].code}
        className="p-5 py-7 bg-editor-light text-neutral-800 dark:bg-editor-dark dark:text-neutral-100"
      />
    </div>
  );
}
