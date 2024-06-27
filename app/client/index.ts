import { getSsrState, hydrate } from "juno/client";
import Page from "app/pages/index?juno";

const ssrState = getSsrState();

hydrate(document, Page, ssrState);
