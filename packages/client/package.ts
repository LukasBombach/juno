type Directive = {
  path: number[];
  attrs: (() => unknown)[];
  events: (() => unknown)[];
  children: ((() => unknown) | number)[];
};

export function hydrate(root: Document | HTMLElement, directives: Directive[]) {
  directives.forEach(directive => {
    const { path, attrs, events, children } = directive;
    const selector = `& > ${path
      .slice(1)
      .map(n => `*:nth-child(${n})`)
      .join(" > ")}`;
    const el = root.querySelector(selector);

    console.log("hydrating", { el, attrs, events, children });
  });
}
