import type { NamedSSRLoadedRendererValue, AsyncRendererComponentFn } from "astro";

const check: AsyncRendererComponentFn<boolean> = async function () {
  return true;
};

const renderToStaticMarkup: AsyncRendererComponentFn<{
  html: string;
  attrs?: Record<string, string>;
}> = async function (Component, props, slots, metadata) {
  //console.log("juno renderToStaticMarkup called", Component, props, slots, metadata);
  console.dir(Component(props), { depth: Infinity });
  return { html: `<div>Hello, Juno!</div><pre>${JSON.stringify(Component(props), null, 2)}</pre>` };
};

export default {
  name: "juno-astro",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
} satisfies NamedSSRLoadedRendererValue;
