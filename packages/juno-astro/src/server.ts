import { renderToStaticMarkup as junoRenderToStaticMarkup } from "./renderToStaticMarkup";
import type { NamedSSRLoadedRendererValue, AsyncRendererComponentFn } from "astro";

const check: AsyncRendererComponentFn<boolean> = async function () {
  return true;
};

const renderToStaticMarkup: AsyncRendererComponentFn<{
  html: string;
  attrs?: Record<string, string>;
}> = async function (Component, props, slots, metadata) {
  return { html: junoRenderToStaticMarkup(Component(props)) };
};

export default {
  name: "juno-astro",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
} satisfies NamedSSRLoadedRendererValue;
