import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import GitHubDark from "monaco-themes/themes/GitHub Dark.json";
import GitHubLight from "monaco-themes/themes/GitHub Light.json";
import { useColorScheme } from "../hooks/useColorScheme";
import { useElementSize } from "../hooks/useElementSize";

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.editor.defineTheme("GitHubDark", GitHubDark as editor.IStandaloneThemeData);
monaco.editor.defineTheme("GitHubLight", GitHubLight as editor.IStandaloneThemeData);

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "typescript") return new tsWorker();
    return new editorWorker();
  },
};

export interface EditorProps {
  value?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({
  value = ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
  className,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { width, height } = useElementSize(containerRef);
  const colorScheme = useColorScheme();

  const theme = colorScheme === "dark" ? "GitHubDark" : "GitHubLight";
  const language = "typescript";

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = editor.create(containerRef.current, {
      value,
      language,
      theme,
      fontSize: 14,
      tabSize: 2,
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 18,
      overviewRulerLanes: 0,
      cursorBlinking: "smooth",
      contextmenu: false,
      folding: false,
      renderLineHighlight: "none",
      matchBrackets: "never",
      guides: {
        indentation: false,
      },
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });

    return () => editorRef.current?.dispose();
  }, []);

  useEffect(() => editorRef.current?.setValue(value), [value]);
  useEffect(() => editor.setTheme(theme), [theme]);
  useEffect(() => editorRef.current?.layout({ width, height }), [width, height]);

  return <code ref={containerRef} className={className} />;
};
