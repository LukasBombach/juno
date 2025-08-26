import { Editor } from "./Editor";

function randomNumbers(): number[] {
  return Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => Math.floor(Math.random() * 100));
}

function ClientCode(props: { num: number; className?: string }) {
  if (typeof window !== "undefined") {
    console.log(`client code ${props.num}`);
  }
  return <pre className={props.className}>console.log('client code {props.num}');</pre>;
}

export function Demo() {
  return (
    <div className="row-start-2 -row-end-2 -col-start-3 -col-end-2 rounded-xl shadow-window grid grid-rows-1 grid-cols-[minmax(200px,14%)_1fr] overflow-hidden">
      <nav className="p-5 py-7 flex flex-col gap-2 bg-neutral-200/80 border-r-1 border-r-neutral-950/10 ">
        <a href="#" className="text-sm text-neutral-700 hover:underline">
          Counter
        </a>
      </nav>
      <section className="p-5 py-7 bg-editor-light text-neutral-800 dark:bg-editor-dark dark:text-neutral-100">
        <Editor />
      </section>
    </div>
  );
}
