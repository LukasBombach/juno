import { signal, effect } from "@preact/signals-core";
import type { Signal } from "@preact/signals-core";
import type { MonacoEditor, createEditor } from "./monacoEditor";

type Props = {
  value: Signal<string>;
  className?: string;
};

type MonacoApi = { createEditor: typeof createEditor };

async function initializeMonaco() {
  const { setupMonaco, createEditor } = await import("./monacoEditor");
  setupMonaco();
  return { createEditor };
}

export async function Editor({ value, className }: Props) {
  const container = signal<HTMLElement | null>(null);
  const editor = signal<MonacoEditor | null>(null);
  const monaco = signal<MonacoApi | null>(null);

  if (typeof window === "object") {
    monaco.value = await initializeMonaco();
  }

  effect(() => {
    editor.value = monaco.value?.createEditor(container.value, { value: value.value }) ?? null;
    return () => editor.value?.dispose();
  });

  return <code className={className} ref={el => ((container.value = el), undefined)} />;
}
