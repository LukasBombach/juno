import { useSyncExternalStore } from "react";

export const useColorScheme = () => {
  const subscribe = (callback: () => void) => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryList.addEventListener("change", callback);
    return () => mediaQueryList.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  return useSyncExternalStore(subscribe, getSnapshot);
};
