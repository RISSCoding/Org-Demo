import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(cb: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

// Snapshot server: false. Server tidak tahu ukuran viewport; komponen yang memakainya
// merender desktop dulu lalu menyesuaikan setelah hydrate.
function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
