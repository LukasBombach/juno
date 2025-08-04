import type { ReactNode, ReactElement } from "react";

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

type VirtualDom = ReactElement;

type TagOrComponent = string | Component;
type Component = (props: Props) => VirtualDom;
type Props = Record<string, any>;

export function createElement(type: TagOrComponent, props: Props, ...children: ReactNode[]): VirtualDom {
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

export const jsxDEV = createElement;

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
