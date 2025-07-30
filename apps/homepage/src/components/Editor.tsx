import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import GitHubDark from "monaco-themes/themes/GitHub Dark.json";
import GitHubLight from "monaco-themes/themes/GitHub Light.json";
import { useColorScheme } from "../hooks/useColorScheme";
import { useElementSize } from "../hooks/useElementSize";

export interface EditorProps {
  value?: string;
  className?: string;
}

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "typescript") return new tsWorker();
    return new editorWorker();
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.editor.defineTheme("GitHubDark", GitHubDark as editor.IStandaloneThemeData);
monaco.editor.defineTheme("GitHubLight", GitHubLight as editor.IStandaloneThemeData);

export const Editor: React.FC<EditorProps> = ({
  value = ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
  className,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const colorScheme = useColorScheme();
  const { width, height } = useElementSize(containerRef);

  const theme = colorScheme === "dark" ? "GitHubDark" : "GitHubLight";
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

  useEffect(() => {
    editorRef.current?.layout({ width, height });
  }, [width, height]);

  return <code ref={containerRef} className={className} />;
};
