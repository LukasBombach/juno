import type { FC, ReactNode, ReactElement } from "react";

/*
function Demo() {
  return (
    <div>
      <section className="p-5 py-7">
        <Test prop="value">child</Test>
      </section>
    </div>
  );
}

function Demo() {
  return createElement(
    "div",
    null,
    createElement(
      "section",
      { className: "p-5 py-7" },
      createElement(Test, { prop: "value" }, "child")
    )
  );
}

*/

type Component = (props: Props) => ReactElement;
type Props = Record<string, any>;

export function createElement(type: string | Component, props: Props, ...children: ReactNode[]): ReactElement {
  if (typeof type === "function") {
    return type({ ...props, children });
  } else {
    return {
      type,
      key: null,
      props: {
        ...props,
        children: children.length === 1 ? children[0] : children,
      },
    };
  }
}

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
  
*/
