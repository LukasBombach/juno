import { importClientComponent, getSsrState, hydrate } from "juno/client";

const Page = await importClientComponent("app/pages");

const ssrState = getSsrState();
const pageState = ssrState[Page.id];

hydrate(Page, pageState, document.body);
