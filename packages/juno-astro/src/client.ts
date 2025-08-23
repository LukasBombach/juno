/* console.log("juno hydration script initialized");

class JunoComponent extends HTMLElement {
  static tagName = "juno-component";

  connectedCallback() {
    console.log("juno component connected", this);
  }
}

window.customElements.define(JunoComponent.tagName, JunoComponent); */

export default (element: HTMLElement) =>
  async (
    Component: any,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    { client }: Record<string, string>
  ) => {
    console.log(element);
    console.log(Component({ ...props, children }));
  };
