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
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenisInstance } from "./lib/scrollLock";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = getLenisInstance();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // The admin layout scrolls inside its own <main>, which the window
    // scroll position says nothing about.
    document.querySelectorAll("main").forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
