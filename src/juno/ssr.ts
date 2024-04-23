export function getState() {
  return JSON.parse(document.querySelector('script[type="juno/data"]')?.textContent || "{}");
}
