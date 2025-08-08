import { signal, effect } from "@maverick-js/signals";
import type { MonacoEditor, createEditor } from "./monacoEditor";

export interface EditorProps {
  value?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({ value, className }) => {
  const container = signal<HTMLElement | null>(null);
  const editor = signal<MonacoEditor | null>(null);
  const monaco = signal<{ createEditor: typeof createEditor } | null>(null);

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
};
