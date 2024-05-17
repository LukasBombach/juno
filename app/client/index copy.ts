import { importComponent, hydrate } from "juno/client";

const Page = await importComponent("app/pages");

hydrate(Page, document.body);
