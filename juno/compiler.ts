import type { WriteSignal } from "@maverick-js/signals";
import type { RenderContext } from "juno/renderContext";

export interface Component {
  (ctx: RenderContext): [path: string, directives: HydrationDirectives][];
  id: string;
}

export type HydrationDirectives = {
  children?: (number | WriteSignal<any> | Component)[];
} & Record<Exclude<string, "children">, any>;

export async function importClientComponent(src: string): Promise<Component> {
  return { fakeImport: true } as any as Component;
}
