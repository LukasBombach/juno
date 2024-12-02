import { parse, print } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  getJsxElements(module).filter(shouldBeHydrated).forEach(appendHydrationMarker);

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
  const module = await parse(src);

  const components = getComponents(module).forEach((component) => {
    getReturnStatements(component)
      .filter(returnsJsx)
      .forEach((returnStatement) => {
        returnStatement;
      });
  });

  getJsxElements(module).filter(shouldBeHydrated).map(toHydrationInstruction);

  return await print(module);
}
