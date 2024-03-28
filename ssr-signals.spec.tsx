const Counter = await () => {
  const count = signal(0, Math.round(Math.random() * 100));
  return el(
    "section",
    {},
    el("label", {}, count()),
    el("hr"),
    el("button", { onClick: () => count.set(count() + 1) }, "Click")
  );
};