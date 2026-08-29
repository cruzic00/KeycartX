import { motion } from "framer-motion";
import { ReactNode } from "react";

// Fades a page in on arrival. Deliberately no `exit` animation, and the
// AnimatePresence around it is not in mode="wait": both of those hold the
// outgoing page on screen for the length of the exit before mounting the new
// one. ScrollToTop has already jumped to the top by then, so that window
// showed the bottom of the page you just left - the footer - for 300ms before
// the new page appeared. Dropping the exit lets the new page mount at once.
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
