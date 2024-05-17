import { signal, effect } from "@maverick-js/signals";
import { importClientMeta } from "juno/clientCompiler";
import { $, getSsrState, findElements } from "juno/client";

const Page = await importClientMeta("app/pages");

const data = getSsrState();
const elements = findElements(Page);

const p = $("body > *:nth-child(1)");
const button = $("body > *:nth-child(2)");

const count = signal(data[0]);

effect(() => {
  p.textContent = count();
});

button.addEventListener("click", () => {
  count.set(count() + 1);
});
