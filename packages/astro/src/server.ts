import type { AstroComponentMetadata, NamedSSRLoadedRendererValue, AsyncRendererComponentFn } from "astro";

const check: AsyncRendererComponentFn<boolean> = async () => {
  return true;
};

const renderToStaticMarkup: AsyncRendererComponentFn<{
  html: string;
  attrs?: Record<string, string>;
}> = async () => {
  return {
    html: "<div>Hello, Juno!</div>",
    attrs: {
      "data-juno": "true",
    },
  };
};

const renderer: NamedSSRLoadedRendererValue = {
  name: "juno",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
};

export default renderer;
