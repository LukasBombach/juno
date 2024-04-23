import { getState, getRoots } from "juno/ssr";
import "style.css";

const state = getState();
const roots = getRoots();

console.log("hello juno");
console.log("state", state);
console.log("roots", roots);
