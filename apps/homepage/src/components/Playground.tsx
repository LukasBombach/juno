import { signal } from "@preact/signals-core";
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

async function fetchDemoCode(demoName: string): Promise<string> {
  const response = await fetch(`/transpiler/${demoName}`);
  const data = await response.json();
  return data.code;
}

export function Playground() {
  // const code = signal(demos[0].code);
  const code = signal("");
  fetchDemoCode("Counter")
    .then(v => (code.value = v))
    .catch(console.error);

  const layoutCss = `row-start-4 -row-end-2 col-start-2 -col-end-2 md:row-start-2 md:-row-end-2 md:col-start-4 md:-col-end-2 rounded-xl shadow-window grid grid-rows-1 grid-cols-[minmax(200px,14%)_1fr] overflow-hidden`;
  const navCss = `p-7 flex flex-col gap-2 bg-neutral-200/80 border-r-1 border-r-neutral-950/10 dark:bg-neutral-900/70`;
  const buttonCss = `text-sm cursor-pointer text-neutral-700 text-left hover:underline dark:text-neutral-100`;

  return (
    <div className={layoutCss}>
      <nav className={navCss}>
        {demos.map((demo, index) => (
          <button onClick={() => (code.value = demos[index].code)} className={buttonCss}>
            {demo.title}
          </button>
        ))}
        <Counter className={buttonCss} />
        <button onClick={() => fetchDemoCode("Counter").then(v => (code.value = v))} className={buttonCss}>
          Counter Code
        </button>
      </nav>
      <Editor
        value={code}
        className="p-5 py-7 bg-editor-light text-neutral-800 dark:bg-editor-dark dark:text-neutral-100"
      />
    </div>
  );
}
