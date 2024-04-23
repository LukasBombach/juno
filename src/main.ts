import { getState, getInstances } from "juno/ssr";
import "style.css";

const state = getState();
const instances = getInstances();

console.log("hello juno");
console.log("state", state);
console.log("instances", instances);
