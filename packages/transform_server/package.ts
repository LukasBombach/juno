import { parse, print } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  getJsxElements(module)
    .filter(shouldBeHydrated)
    .forEach((el) => appendHydrationMarker(el));

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
  const module = await parse(src);

  getFunctions(module)
    .flatMap(getReturnStatements)
    .flatMap(getReturnedJsxRoots)
    .forEach((el) => replace(el, getDomBindings(el)));

  return await print(module);
}
