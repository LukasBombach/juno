type Directive = {
  path: number[];
  children: (() => unknown)[];
} & Record<string, unknown>;

export function hydrate(root: Document | HTMLElement, directives: Directive[]) {
  directives.forEach(directive => {
    const { path, children, ...props } = directive;
    const selector = `& > ${path
      .slice(1)
      .map(n => `*:nth-child(${n})`)
      .join(" > ")}`;
    const el = root.querySelector(selector);

    console.log("hydrating", { el, children, props });
  });
}
