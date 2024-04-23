import "./style.css";

const DATA = JSON.parse(document.querySelector('script[type="juno/data"]')?.textContent || "{}");

console.log("juno", DATA);
