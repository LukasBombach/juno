import * as monaco from "monaco-editor";
// import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import GitHubDark from "monaco-themes/themes/GitHub Dark.json";
import GitHubLight from "monaco-themes/themes/GitHub Light.json";

export type MonacoEditor = monaco.editor.IStandaloneCodeEditor;

type MonacoOptions = monaco.editor.IStandaloneEditorConstructionOptions;
type MonacoTheme = monaco.editor.IStandaloneThemeData;
type MonacoEnvironment = monaco.Environment;

const typescriptDefaults = monaco.languages.typescript.typescriptDefaults;
const defineTheme = monaco.editor.defineTheme;
const create = monaco.editor.create;

const monacoEnvironment: MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "typescript") return new tsWorker();
    return new editorWorker();
  },
};

const defaultOptions: MonacoOptions = {
  theme: "GitHubLight",
  language: "typescript",
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
};

export function setupMonaco() {
  if (window.MonacoEnvironment) return;
  window.MonacoEnvironment = monacoEnvironment;

  defineTheme("GitHubDark", GitHubDark as MonacoTheme);
  defineTheme("GitHubLight", GitHubLight as MonacoTheme);

  typescriptDefaults.setEagerModelSync(true);
}

export function createEditor(el: HTMLElement | null, options?: MonacoOptions): MonacoEditor | null {
  return el ? create(el, { ...defaultOptions, ...options }) : null;
}
