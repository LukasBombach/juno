import { parse, print } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  getJsxElements(module).filter(shouldBeHydrated).forEach(appendHydrationMarker);

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
  const module = await parse(src);

  getFunctions(module)
    .flatMap(getReturnStatements)
    .filter(returnsJsx)
    .forEach((rtn) => replace(rtn, toHydrationInstructions(rtn)));

  return await print(module);
}
