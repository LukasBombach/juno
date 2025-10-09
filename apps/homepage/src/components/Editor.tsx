import { signal, effect } from "@preact/signals-core";
import type { Signal } from "@preact/signals-core";
import type { MonacoEditor, createEditor } from "./monacoEditor";

type Props = {
  value: Signal<string>;
  className?: string;
};

export function Editor({ value, className }: Props) {
  const monaco = signal<{ createEditor: typeof createEditor } | null>(null);
  const editor = signal<MonacoEditor | null>(null);
  const container = signal<HTMLElement | null>(null);

  if (typeof window === "object") {
    import("./monacoEditor").then(({ setupMonaco, createEditor }) => {
      setupMonaco();
      monaco.value = { createEditor };
    });
  }

  effect(() => {
    editor.value = monaco.value?.createEditor(container.value, { value: value.value }) ?? null;
    return () => editor.value?.dispose();
  });

  return <code className={className} ref={el => ((container.value = el), undefined)} />;
}
