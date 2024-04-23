import { getState } from "juno/ssr";
import "style.css";

const DATA = getState();

console.log("juno", DATA);
