import "react";
declare module "react" {
  interface ScriptHTMLAttributes<T> {
    /**
     * Indicates whether the script should render inline in the document.
     * If true, the source will be rendered as a child of the script tag.
     */
    inline?: boolean;
  }
}
