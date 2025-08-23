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

export function Editor({ value, className }: { value?: string; className?: string }) {
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

  // return [{ path: [1], ref: (el: HTMLElement) => container.set(el) }];
  return (
    <code className={className} ref={el => container.set(el)}>
      {value}
    </code>
  );
}
