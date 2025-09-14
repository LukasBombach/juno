import { signal, effect } from "@maverick-js/signals";
import type { MonacoEditor, createEditor } from "./monacoEditor";

type Props = {
  value?: string;
  className?: string;
};

const counterCode = `let count = 0;

const increment = () => {
  count++;
  console.log('Counter:', count);
};`;

export function Editor({ value = counterCode, className }: Props) {
  const monaco = signal<{ createEditor: typeof createEditor } | null>(null);
  const editor = signal<MonacoEditor | null>(null);
  const container = signal<HTMLElement | null>(null);

  if (typeof window === "object") {
    import("./monacoEditor").then(({ setupMonaco, createEditor }) => {
      setupMonaco();
      monaco.set({ createEditor });
    });
  }

  effect(() => {
    editor.set(monaco()?.createEditor(container(), { value }) ?? null);
    return () => editor()?.dispose();
  });

  return <code className={className} ref={el => (container.set(el), undefined)} />;
}
