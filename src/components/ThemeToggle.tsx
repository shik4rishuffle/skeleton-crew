"use client";
import { useCallback, useEffect, useSyncExternalStore } from "react";

// The star feature. "Before mode" swaps the site's design tokens for a generic template look
// (flat grey, royal blue, Arial, square corners). Because every block only reads tokens, the
// whole site flips from one class on <body>. State lives on the body class so the hero button
// and the fixed pill stay in sync.
const EVENT = "before-mode-change";
const KEY = "before-mode";

function read() {
  return typeof document !== "undefined" && document.body.classList.contains(KEY);
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
export function setBeforeMode(on: boolean) {
  document.body.classList.toggle(KEY, on);
  try { sessionStorage.setItem(KEY, on ? "1" : "0"); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useBeforeMode() {
  const before = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => setBeforeMode(!read()), []);
  return { before, toggle };
}

/** Fixed pill, bottom right, always reachable. Reads THEIRS when the generic look is on. */
export default function ThemeToggle() {
  const { before, toggle } = useBeforeMode();
  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) === "1") setBeforeMode(true); } catch {}
  }, []);
  return (
    <button type="button" className="toggle-pill" onClick={toggle} aria-pressed={before} aria-label="Toggle between their generic template look and our design">
      {before ? "THEIRS" : "OURS"}
    </button>
  );
}
