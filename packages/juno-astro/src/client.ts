declare global {
  interface Window {
    JUNO_COMPONENTS: Record<string, Function>;
  }
}

window.JUNO_COMPONENTS = {};

type TODO_PROPS = Record<string, any>;

interface ComponentHydration {
  component: (props: TODO_PROPS) => Hydration;
}

interface ElementHydration {
  name?: string;
  elementId: string;
  ref?: (el: Element) => void;
  children?: (() => JsxExpressionFunction | string | number)[];
  [key: string]: unknown;
}

type JsxExpressionFunction = () => string | number | unknown;

type Hydration = ComponentHydration | ElementHydration | ElementHydration[];

function* hydrate(hydration: Hydration): Generator<ElementHydration, void, unknown> {
  if (Array.isArray(hydration)) {
    for (const h of hydration) {
      yield* hydrate(h);
    }
    return;
  }

  if (typeof hydration.component === "function") {
    yield* hydrate(hydration.component({}));
    return;
  }

  yield hydration as ElementHydration;
}

export default (element: HTMLElement) =>
  async (
    component: any,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    const hydrations = hydrate(component({}));

    [...element.querySelectorAll("[data-element-id]")].forEach(el => {
      /**
       * Fragile hydration algorith:
       * We expect that the hydraions returned from the client code will match the
       * exact rendering of the server. We assume that the client code is generated
       * in a way that when we pass in the same data it will return hydration with the
       * exact same number of elements in the exact same order.
       *
       * With this assumption we can simply iterate over the elements with data-element-id
       * attributes in the DOM and apply the next hydration to each one.
       */
      const hydration = hydrations.next().value;

      if (!hydration) {
        console.warn("No more hydration data available for", el);
        return;
      }

      if (hydration.elementId !== el.getAttribute("data-element-id")) {
        console.warn("Mismatched hydration id", hydration.elementId);
        return;
      }

      for (const [name, value] of Object.entries(hydration)) {
        // @ts-expect-error wip
        if (name === "ref") value(el);
        if (name.match(/^on[A-Z]/)) el.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
      }
    });
  };
