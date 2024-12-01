import { parse, print } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  return await print(module);
}
