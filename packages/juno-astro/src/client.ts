import { effect } from "@preact/signals-core";

type TODO_PROPS = Record<string, any>;

type Component = (props: TODO_PROPS) => Promise<Hydration[]>;

interface ComponentHydration {
  component: Component;
  props: TODO_PROPS;
}

interface ElementHydration {
  name?: string;
  elementId: string;
  ref?: (el: Element) => void;
  children?: (() => unknown)[];
  [key: string]: unknown;
}

type Hydration = ComponentHydration | ElementHydration;

function isElementHydration(hydration: Hydration): hydration is ElementHydration {
  return "elementId" in hydration;
}

function isComponentHydration(hydration: Hydration): hydration is ComponentHydration {
  return "component" in hydration;
}

export default (element: HTMLElement) =>
  async (
    component: Component,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    const elements = [...element.querySelectorAll("[data-element-id]")];

    console.log(
      "ssr",
      elements.map(el => `<${el.tagName.toLowerCase()}> ${el.getAttribute("data-element-id")}`)
    );

    await hydrateComponent({ component, props });

    async function hydrate(hydration: Hydration) {
      if (isElementHydration(hydration)) {
        hydrateElement(hydration);
      } else if (isComponentHydration(hydration)) {
        await hydrateComponent(hydration);
      }
    }

    async function hydrateComponent(hydration: ComponentHydration) {
      console.log("c", hydration);
      const { component, props } = hydration;
      const subHydrations = await component(props);
      for (const subHydration of subHydrations) {
        hydrate(subHydration);
      }
    }

    function hydrateElement(hydration: ElementHydration) {
      console.log("e", hydration);
      const el = elements.shift();
      if (!el) {
        console.error("No more elements to hydrate for", hydration);
        return;
      } else if (el.getAttribute("data-element-id") !== hydration.elementId) {
        console.error("Mismatched hydration id", hydration.elementId, el);
      } else {
        if (hydration.ref) {
          hydration.ref(el);
        }
        for (const [name, value] of Object.entries(hydration)) {
          if (name.match(/^on[A-Z]/)) {
            el.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
          }
        }
      }

      /**
       * crazy algorithm to interleave static text nodes with dynamic ones
       * based on the children array which contains numbers (static text length)
       * and functions (dynamic text).
       *
       * We assume that the server rendered the exact same static text content
       * as we have here, so we can split the text nodes at the correct indices.
       */

      let index = 0;
      let text = el.firstChild;

      for (const child of hydration.children || []) {
        // console.log("child", child);

        /**
         * child is a number: static text length
         */
        if (typeof child === "number") {
          index += child;

          /**
           * child is a function: JSX container
           */
        } else if (typeof child === "function") {
          /**
           * execute child once to know what kind of value it is (string, number, array)
           */
          const jsxExpressionValue = child();

          /**
           * jsx returns array: must be the result of nested JSX (e.g. <div>{condition && <span>...</span>}</div>)
           * todo we have a nested array here, because of arr.map(<jsx>), we're treatig that wrong, but its good enough for now
           */
          if (Array.isArray(jsxExpressionValue)) {
            for (const exp of jsxExpressionValue) {
              if (Array.isArray(exp)) {
                for (const e of exp) {
                  if (isElementHydration(e)) {
                    hydrateElement(e);
                  }
                }
              } else {
                // console.log("non-array nested exp", exp);
              }
            }
          } else if (typeof jsxExpressionValue === "string" || typeof jsxExpressionValue === "number") {
            if (isTextNode(text)) {
              const currentText = text.splitText(index);
              text = currentText.splitText(String(jsxExpressionValue).length);
              index = 0;
              effect(() => {
                currentText.textContent = String(child());
              });
            }
          } else {
            console.log("non-function jsxExpressionValue", jsxExpressionValue);
          }

          /**
           * child is not a number or function: error
           */
        } else {
          console.log("non-function child", child);
        }
      }
    }

    return;
  };

function isTextNode(node: Node | null): node is Text {
  return node?.nodeType === Node.TEXT_NODE;
}
