import { root, signal, computed, effect, tick } from "@maverick-js/signals";
import * as monaco from "monaco-editor";
import { editor as monacoEditor } from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import GitHubDark from "monaco-themes/themes/GitHub Dark.json";
import GitHubLight from "monaco-themes/themes/GitHub Light.json";
import { useColorScheme } from "../hooks/useColorScheme";
import { useElementSize } from "../hooks/useElementSize";

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.editor.defineTheme("GitHubDark", GitHubDark as editor.IStandaloneThemeData);
monaco.editor.defineTheme("GitHubLight", GitHubLight as editor.IStandaloneThemeData);

const monacoSettings = {
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
  guides: { indentation: false },
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
} as const;

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
  const editor = signal<monacoEditor.IStandaloneCodeEditor | null>(null);
  const { width, height } = useElementSize(containerRef);
  const colorScheme = useColorScheme();

  const theme = colorScheme === "dark" ? "GitHubDark" : "GitHubLight";
  const language = "typescript";

  const container = signal<HTMLElement | null>(null);

  const editor2 = computed(() => {
    const el = container();
    if (!el) return null;
    return monacoEditor.create(el, { value, language, theme, ...monacoSettings });
  });

  effect(() => {
    const el = container();

    if (!el) return;

    const e = monacoEditor.create(el, {
      value,
      language,
      theme,
      ...monacoSettings,
    });

    editor.set(e);

    return () => e.dispose();
  });

  effect(() => editor()?.setValue(value));
  effect(() => editor()?.layout({ width, height }));
  // effect(() => monacoEditor.setTheme(theme));

  return <code ref={el => container.set(el)} className={className} />;
};
