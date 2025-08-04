import type { ReactElement, ReactNode } from "react";

/*

{
  "type": "div",
  "key": null,
  "props": {
    "children": {
      "type": "section",
      "key": null,
      "props": {
        "className": "p-5 py-7",
        "children": {
          "key": null,
          "props": {
            "prop": "value",
            "children": "child"
          }
        }
      }
    }
  }
}


function Demo() {
  return createElement(
    "div",
    null,
    createElement(
      "section",
      { className: "p-5 py-7" },
      createElement((0, __vite_ssr_import_0__.Test), { prop: "value" }, "child")
    )
  );
}
*/

export function renderToStaticMarkup(el: ReactNode): string {}

function isReactElement(el: ReactNode): el is ReactElement {
  return typeof el === "object" && el !== null && "type" in el && "props" in el && "key" in el;
}
