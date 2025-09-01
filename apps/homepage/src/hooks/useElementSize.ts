import { useState, useLayoutEffect } from "react";
import type { RefObject } from "react";

export function useElementSize<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === el) {
          const { width: w, height: h } = entry.contentRect;
          setSize(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
        }
      }
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  return { width, height };
}
