import { signal, effect } from "@maverick-js/signals";

const data = JSON.parse(document.querySelector("script[type='juno/data']")?.textContent || "[]");
const p = document.querySelector("body > *:nth-child(1)")!;
const button = document.querySelector("body > *:nth-child(2)")!;

const count = signal(data[0]);

effect(() => (p.textContent = count()));

button.addEventListener("click", () => count.set(count() + 1));
