import Monaco from "@monaco-editor/react";

import type { FC } from "react";
import type { OnChange, EditorProps as MonacoEditorProps } from "@monaco-editor/react";

export interface EditorProps extends MonacoEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export const Editor: FC<EditorProps> = ({
  value = "",
  language = "typescript",
  theme = "vs-dark",
  height = "100%",
  onChange,
  ...rest
}) => {
  const handleChange: OnChange = val => onChange?.(val);

  return (
    <Monaco
      value={value}
      defaultLanguage={language}
      theme={theme}
      height={height}
      onChange={handleChange}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      }}
      {...rest}
    />
  );
};
