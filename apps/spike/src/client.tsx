import { hydrate } from "@juno/client";
import { signal } from "@maverick-js/signals";
import Page from "./page";

console.log(Page({ signal, ssrData: [] }));

hydrate(document, <Page />);
