import { signal, effect } from "@maverick-js/signals";
// import type { MonacoEditor, createEditor } from "./monacoEditor";

/**
 * esrap remove type from imports so the actual file will be imported during ssr
 */
type MonacoEditor = any;

/* export const Editor: React.FC<{
  value?: string;
  className?: string;
}> = ({ value, className }) => { */

const counterCode = `let count = 0;

const increment = () => {
  count++;
  console.log('Counter:', count);
};`;

export function Editor({ value = counterCode, className }: { value?: string; className?: string }) {
  const monaco = signal<{ createEditor: any /* typeof createEditor */ } | null>(null);
  const container = signal<HTMLElement | null>(null);
  const editor = signal<MonacoEditor | null>(null);

  if (typeof window !== "undefined") {
    import("./monacoEditor").then(({ setupMonaco, createEditor }) => {
      setupMonaco();
      monaco.set({ createEditor });
    });
  }

  effect(() => {
    editor.set(monaco()?.createEditor(container(), { value }) ?? null);
    return () => editor()?.dispose();
  });

  return <code className={className} ref={el => container.set(el)} />;
}
