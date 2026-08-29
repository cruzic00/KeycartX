// Scroll locking for modals.
//
// Locking the document alone is not enough here, because Lenis drives its own
// smooth scrolling from wheel events and ignores `overflow: hidden`.
//
// Note we deliberately do NOT call lenis.stop(): that suppresses wheel
// scrolling everywhere, including *inside* the modal, which makes a long form
// unscrollable. Instead each modal overlay carries `data-lenis-prevent`, which
// tells Lenis to ignore wheel events over it and let native scrolling happen.
import { useEffect } from "react";
import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

/** Registered by SmoothScroll so modal helpers can reach the instance. */
export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenisInstance() {
  return lenisInstance;
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Removing the scrollbar shifts the layout; pad by its width so the
    // content underneath doesn't jump sideways as the modal opens.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}
