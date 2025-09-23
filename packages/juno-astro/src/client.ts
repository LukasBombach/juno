import { effect } from "@maverick-js/signals";

declare global {
  interface Window {
    JUNO_COMPONENTS: Record<string, Function>;
  }
}

// window.JUNO_COMPONENTS = {};

type TODO_PROPS = Record<string, any>;

type Component = (props: TODO_PROPS) => Hydration[];

interface ComponentHydration {
  component: Component;
}

interface ElementHydration {
  name?: string;
  elementId: string;
  ref?: (el: Element) => void;
  children?: (() => JsxExpressionFunction | number)[];
  [key: string]: unknown;
}

type JsxExpressionFunction = () => string | number | unknown;

type Hydration = ComponentHydration | ElementHydration;

function isComponentHydration(hydration: Hydration): hydration is ComponentHydration {
  return "component" in hydration;
}

// function* hydrate(hydration: Hydration): Generator<ElementHydration, void, unknown> {
//   if (Array.isArray(hydration)) {
//     for (const h of hydration) {
//       yield* hydrate(h);
//     }
//     return;
//   }
//
//   if (typeof hydration.component === "function") {
//     yield* hydrate(hydration.component({}));
//     return;
//   }
//
//   yield hydration as ElementHydration;
// }

export default (element: HTMLElement) =>
  async (
    component: Component,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    const elements = [...element.querySelectorAll("[data-element-id]")];
    hydrate(component);

    function hydrate(component: Component) {
      const hydrations = component({});

      for (const hydration of hydrations) {
        if (isComponentHydration(hydration)) {
          hydrate(hydration.component);
        } else {
          const el = elements.shift();

          if (!el) {
            console.warn("No more elements to hydrate for", hydration);
            continue;
          }

          hydrateElement(hydration, el as HTMLElement);
        }
      }
    }

    function hydrateElement(hydration: ElementHydration, el: HTMLElement) {
      const { elementId, ref, children, ...eventHandlers } = hydration;

      /**
       * Ensure that the element ids match
       */
      if (elementId !== el.getAttribute("data-element-id")) {
        console.warn("Mismatched hydration id", elementId, el);
        return;
      }

      /**
       * Call ref with the element
       */
      if (ref) {
        ref(el);
      }

      /**
       * Add event listeners
       */
      for (const [name, value] of Object.entries(eventHandlers)) {
        if (!name.match(/^on[A-Z]/)) {
          console.warn("Unsupported hydration property", name, value);
        } else {
          el.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
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
      asssertChildNode(text);
      for (const child of children || []) {
        if (typeof child === "number") {
          index += child;
        } else {
          assertTextNode(text);
          const currentText = text.splitText(index);
          text = currentText.splitText(String(child()).length);
          index = 0;
          effect(() => {
            currentText.textContent = String(child());
          });
        }
      }
    }

    // const hydrations = hydrate(component({}));
    //
    // [...element.querySelectorAll("[data-element-id]")].forEach(el => {
    //   /**
    //    * Fragile hydration algorith:
    //    * We expect that the hydraions returned from the client code will match the
    //    * exact rendering of the server. We assume that the client code is generated
    //    * in a way that when we pass in the same data it will return hydration with the
    //    * exact same number of elements in the exact same order.
    //    *
    //    * With this assumption we can simply iterate over the elements with data-element-id
    //    * attributes in the DOM and apply the next hydration to each one.
    //    */
    //   const hydration = hydrations.next().value;
    //
    //   if (!hydration) {
    //     console.warn("No more hydration data available for", el);
    //     return;
    //   }
    //
    //   if (hydration.elementId !== el.getAttribute("data-element-id")) {
    //     console.warn("Mismatched hydration id", hydration.elementId);
    //     return;
    //   }
    //
    //   for (const [name, value] of Object.entries(hydration)) {
    //     // @ts-expect-error wip
    //     if (name === "ref") value(el);
    //     if (name.match(/^on[A-Z]/)) el.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
    //     if (name === "children" && Array.isArray(value)) {
    //       for (const child of value) {
    //         const result = child();
    //         if (typeof result === "string" || typeof result === "number") {
    //           el.append(result.toString());
    //         } else if (result != null) {
    //           console.warn("Unsupported child function result", result);
    //         }
    //       }
    //     }
    //   }
    // });
  };

function asssertChildNode(node: ChildNode | null): asserts node is ChildNode {
  if (!node) {
    throw new Error(`Expected child node`);
  }
}

function assertTextNode(node: Node): asserts node is Text {
  if (node.nodeType !== Node.TEXT_NODE) {
    throw new Error(`Expected text node`);
  }
}
