import type { AstroComponentMetadata, NamedSSRLoadedRendererValue, AsyncRendererComponentFn } from "astro";

const check: AsyncRendererComponentFn<boolean> = async () => {
  return true;
};

const renderer: NamedSSRLoadedRendererValue = {
  name: "juno",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
};

export default renderer;
