import { signal, effect } from "@maverick-js/signals";
import { importClientMeta } from "juno/compiler";
import { $, getData, findElements } from "juno/client";

const Page = await importClientMeta("app/pages");

const data = getData();
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
