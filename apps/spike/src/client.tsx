import { hydrate } from "@juno/client";
import Page from "./page";

console.log(Page.toString(), Page());

hydrate(document, <Page />);
