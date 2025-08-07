import { signal, effect } from "@maverick-js/signals";
import { setupMonaco, createEditor, type MonacoEditor } from "./monacoEditor";

export interface EditorProps {
  value?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({ value, className }) => {
  const container = signal<HTMLElement | null>(null);
  const editor = signal<MonacoEditor | null>(null);

  effect(() => {
    setupMonaco();
  });

  effect(() => {
    editor.set(createEditor(container(), { value }));
    return () => editor()?.dispose();
  });

  return <code className={className} ref={el => container.set(el)} />;
};
