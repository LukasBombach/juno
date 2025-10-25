import { signal } from "@preact/signals-core";
import { Counter } from "./Counter";
import { Editor } from "./Editor";

const demos2 = ["Counter", "Editor", "Playground"];

async function fetchDemoCode(demoName: string): Promise<string> {
  const response = await fetch(`/transpiler/${demoName}`);
  const data = await response.json();
  return data.code;
}

export function Playground() {
  const code = signal("");

  if (typeof window === "object") {
    fetchDemoCode("Counter")
      .then(v => (code.value = v))
      .catch(console.error);
  }

  return (
    <div className="row-start-4 -row-end-2 col-start-2 -col-end-2 md:row-start-2 md:-row-end-2 md:col-start-4 md:-col-end-2 rounded-xl shadow-window grid grid-rows-1 grid-cols-[minmax(200px,14%)_1fr] overflow-hidden">
      <nav className="p-7 flex flex-col gap-2 bg-neutral-200/80 border-r-1 border-r-neutral-950/10 dark:bg-neutral-900/70">
        {demos2.map(demo => (
          <button
            onClick={() => fetchDemoCode(demo).then(v => (code.value = v))}
            className="text-sm cursor-pointer text-neutral-700 text-left hover:underline dark:text-neutral-100"
          >
            {demo}
          </button>
        ))}
        <Counter className="text-sm cursor-pointer text-neutral-700 text-left hover:underline dark:text-neutral-100" />
      </nav>
      <Editor
        value={code}
        className="p-5 py-7 bg-editor-light text-neutral-800 dark:bg-editor-dark dark:text-neutral-100"
      />
    </div>
  );
}
