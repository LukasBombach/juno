import React, { useRef, useEffect } from "react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";

export interface EditorProps {
  value?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({ value = "", className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const theme = "vs-dark";
  const language = "typescript";

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

    return () => {
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

  return <code ref={containerRef} className={className} />;
};
