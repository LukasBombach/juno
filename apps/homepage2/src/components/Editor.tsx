import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";

export interface EditorProps {
  language?: string;
  value?: string;
  height?: string;
  width?: string;
  theme?: "vs" | "vs-dark" | "hc-black";
  readonly?: boolean;
  fontSize?: number;
  lineNumbers?: "on" | "off" | "relative" | "interval";
  wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded";
  minimap?: boolean;
  scrollBeyondLastLine?: boolean;
  automaticLayout?: boolean;
  onChange?: (value: string) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export const Editor: React.FC<EditorProps> = ({
  language = "javascript",
  value = "",
  height = "400px",
  width = "100%",
  theme = "vs-dark",
  readonly = false,
  fontSize = 14,
  lineNumbers = "on",
  wordWrap = "on",
  minimap = true,
  scrollBeyondLastLine = false,
  automaticLayout = true,
  onChange,
  onMount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    // Configure Monaco Environment
    if (typeof window !== "undefined") {
      (window as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId: string, label: string) {
          if (label === "json") {
            return "/monaco-workers/json.worker.js";
          }
          if (label === "css" || label === "scss" || label === "less") {
            return "/monaco-workers/css.worker.js";
          }
          if (label === "html" || label === "handlebars" || label === "razor") {
            return "/monaco-workers/html.worker.js";
          }
          if (label === "typescript" || label === "javascript") {
            return "/monaco-workers/ts.worker.js";
          }
          return "/monaco-workers/editor.worker.js";
        },
      };

      // Configure TypeScript defaults
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
        allowJs: true,
        strict: true,
      });

      // Add Astro type definitions
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `
        declare module 'astro:*';
        declare module '*.astro' {
          const Component: any;
          export default Component;
        }
        declare module '*.vue' {
          const Component: any;
          export default Component;
        }
        declare module '*.svelte' {
          const Component: any;
          export default Component;
        }
        `,
        "astro-types.d.ts"
      );

      if (containerRef.current) {
        // Create the editor
        const editor = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme,
          readOnly: readonly,
          fontSize,
          lineNumbers,
          wordWrap,
          minimap: { enabled: minimap },
          scrollBeyondLastLine,
          automaticLayout,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          renderWhitespace: "selection",
          renderControlCharacters: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        });

        editorRef.current = editor;

        // Set up change listener
        const disposable = editor.onDidChangeModelContent(() => {
          const currentValue = editor.getValue();
          if (onChange) {
            onChange(currentValue);
          }
        });

        // Call onMount callback
        if (onMount) {
          onMount(editor);
        }

        setIsEditorReady(true);

        // Cleanup function
        return () => {
          disposable.dispose();
          editor.dispose();
        };
      }
    }
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value, isEditorReady]);

  // Update editor language when prop changes
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language, isEditorReady]);

  // Update editor theme when prop changes
  useEffect(() => {
    if (isEditorReady) {
      monaco.editor.setTheme(theme);
    }
  }, [theme, isEditorReady]);

  return (
    <div className="monaco-editor-wrapper" style={{ width, height }}>
      <div ref={containerRef} className="monaco-editor-container" style={{ width: "100%", height: "100%" }} />
      {!isEditorReady && (
        <div className="monaco-loading">
          <div className="loading-spinner"></div>
          <span>Loading Monaco Editor...</span>
        </div>
      )}
      <style>{`
        .monaco-editor-wrapper {
          position: relative;
          border: 1px solid #e1e5e9;
          border-radius: 6px;
          overflow: hidden;
          background: ${theme === "vs-dark" ? "#1e1e1e" : "#ffffff"};
        }

        .monaco-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: ${theme === "vs-dark" ? "#cccccc" : "#666666"};
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid ${theme === "vs-dark" ? "#404040" : "#e1e5e9"};
          border-top: 2px solid ${theme === "vs-dark" ? "#007acc" : "#0066cc"};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
