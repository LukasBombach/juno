import React, { useRef, useEffect } from "react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";

export interface EditorProps {
  value?: string;
  language?: string;
  theme?: string;
  height?: string;
  onChange?: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  value = "",
  language = "typescript",
  theme = "vs-dark",
  height = "100%",
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = editor.create(containerRef.current, {
      value,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });

    const disposable = editorRef.current.onDidChangeModelContent(() => {
      onChange && onChange(editorRef.current!.getValue());
    });

    return () => {
      disposable.dispose();
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      editor.setModelLanguage(editorRef.current.getModel()!, language!);
      editor.setTheme(theme!);
    }
  }, [language, theme]);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
};
