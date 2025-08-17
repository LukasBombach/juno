import { signal, effect } from "@maverick-js/signals";
import type { MonacoEditor, createEditor } from "./monacoEditor";

export const Editor: React.FC<{
  value?: string;
  className?: string;
}> = ({ value, className }) => {
  const monaco = signal<{ createEditor: typeof createEditor } | null>(null);
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
  return <code className={className} ref={el => container.set(el)} />;
};
