import type { NamedSSRLoadedRendererValue, AsyncRendererComponentFn } from "astro";

const check: AsyncRendererComponentFn<boolean> = async (...args) => {
  console.log("juno check called", ...args);
  return true;
};

const renderToStaticMarkup: AsyncRendererComponentFn<{
  html: string;
  attrs?: Record<string, string>;
}> = async (...args) => {
  console.log("juno renderToStaticMarkup called", ...args);
  return { html: "<div>Hello, Juno!</div>" };
};

const renderer: NamedSSRLoadedRendererValue = {
  name: "juno-astro",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
};

export default renderer;
