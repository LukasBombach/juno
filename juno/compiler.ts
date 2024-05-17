import type { WriteSignal } from "@maverick-js/signals";

export interface Component {
  (): [selector: string, directives: HydrationDirectives][];
  id: string;
}

export type HydrationDirectives = {
  children?: (number | WriteSignal<any> | Component)[];
} & Record<Exclude<string, "children">, any>;

export async function importClientComponent(src: string): Promise<Component> {
  return { fakeImport: true } as any as Component;
}
