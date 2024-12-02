import { parse, print } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  getJsxElements(module).filter(shouldBeHydrated).forEach(appendHydrationMarker);

  return await print(module);
}
