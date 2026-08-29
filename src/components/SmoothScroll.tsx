import { useEffect } from "react";
import Lenis from "lenis";
import { setLenisInstance } from "../lib/scrollLock";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    // Expose it so useScrollLock can pause smooth scrolling while a modal
    // is open - Lenis drives scrolling itself and ignores overflow:hidden.
    setLenisInstance(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
