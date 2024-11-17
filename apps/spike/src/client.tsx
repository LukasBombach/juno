import { hydrate } from "@juno/client";
import Page from "./page";

console.debug(Page.toString());
console.debug(Page());

// todo hydrate(document, <Page />);
hydrate(document, Page() as any);
