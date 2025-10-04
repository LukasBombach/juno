import { signal, effect } from "@maverick-js/signals";
import type { ReadSignal } from "@maverick-js/signals";
import type { MonacoEditor, createEditor } from "./monacoEditor";

type Props = {
  value: ReadSignal<string>;
  className?: string;
};

export function Editor({ value, className }: Props) {
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
    editor.set(monaco()?.createEditor(container(), { value: value() }) ?? null);
    return () => editor()?.dispose();
  });

  return <code className={className} ref={el => (container.set(el), undefined)} />;
}
