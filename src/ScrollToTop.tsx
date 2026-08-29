// Reset scroll on navigation.
//
// A browser resets scroll when it loads a new document, but a SPA never
// does - React Router swaps the view and leaves the scroll offset alone, so
// clicking a product from halfway down the home page opens the product page
// already scrolled past the image.
//
// Lenis owns the scroll position when smooth scrolling is active, so telling
// the window alone is not enough; Lenis would just animate back to where it
// thinks it should be.
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenisInstance } from "./lib/scrollLock";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect, not useEffect: this has to land before the browser
  // paints. With useEffect the new route was painted once at the old scroll
  // offset first, which is a visible flash of whatever happens to sit there -
  // usually the footer, since clicking a product means you had scrolled down.
  useLayoutEffect(() => {
    // Both, not either. Telling only Lenis left the window untouched when
    // Lenis declined the request; telling only the window left Lenis holding
    // the old offset, which it then re-applied on its next frame.
    window.scrollTo(0, 0);
    // force: true - without it Lenis ignores the call whenever scrolling is
    // stopped or locked, which is exactly when a modal has just closed.
    getLenisInstance()?.scrollTo(0, { immediate: true, force: true });

    // The admin layout scrolls inside its own <main>, which the window
    // scroll position says nothing about.
    document.querySelectorAll("main").forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
