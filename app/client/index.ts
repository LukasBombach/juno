import { signal, effect } from "@maverick-js/signals";

const $ = (q: string) => document.querySelector(q)!;

const dataText = $("script[type='juno/data']").textContent!;
const data = JSON.parse(dataText);

const p = $("body > *:nth-child(1)");
const button = $("body > *:nth-child(2)");

const count = signal(data[0]);

effect(() => {
  p.textContent = count();
});

button.addEventListener("click", () => {
  count.set(count() + 1);
});
