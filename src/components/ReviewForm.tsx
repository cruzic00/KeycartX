// Port of app/products/[slug]/parts/ReviewForm.tsx.
// - useRouter()/router.refresh() doesn't exist outside Next.js; replaced with
//   an `onSubmitted` callback so the parent ProductDetail page can re-fetch
//   the product (and its updated review list) after a successful submit.
// - The original used a React 19 <form action={async fn}> server-action-style
//   handler; converted to a plain onSubmit handler for clarity/portability.
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted?: () => void;
}) {
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const rating = formData.get("rating");
    const comment = formData.get("comment");

    const payload = {
      productId,
      rating,
      comment,
      reviewer: user?.name || "Anonymous",
      image: "",
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitting(false);
        setIsOpen(false);
        onSubmitted?.();
      } else {
        setSubmitting(false);
        try {
          const data = await res.json();
          alert(data.error || "Failed to submit review");
        } catch {
          alert("Failed to submit review. Please try again.");
        }
      }
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-[#1f2937] text-white font-bold rounded-full hover:bg-[#374151] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Write a Review
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-[#1f2937]"
              >
                ✕
              </button>

              {!user ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🔐</div>
                  <h4 className="text-2xl font-bold mb-3 text-[#1f2937]">Sign in required</h4>
                  <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Please log in to share your experience with the community.</p>
                  <div className="flex flex-col gap-3">
                    <Link
                      to={`/login?redirect=/products/${productId}`}
                      className="w-full py-3.5 bg-[#1f2937] text-white font-bold rounded-xl hover:bg-[#374151] transition-colors"
                    >
                      Log In
                    </Link>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3.5 text-neutral-500 font-medium hover:text-[#1f2937] transition-colors"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="text-2xl font-bold mb-2 text-[#1f2937]">Share your thoughts</h4>
                  <p className="text-neutral-500 mb-8">How was your experience with this product?</p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="hidden" name="productId" value={productId} />

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Overall Rating</label>
                      <div className="flex justify-between bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <label key={star} className="flex-1 cursor-pointer group relative py-2">
                            <input type="radio" name="rating" value={star} className="peer sr-only" required defaultChecked={star === 5} />
                            <div className="text-center text-2xl grayscale opacity-30 peer-checked:grayscale-0 peer-checked:opacity-100 peer-checked:scale-110 transition-all group-hover:grayscale-0 group-hover:opacity-70">⭐</div>
                            <div className="text-[10px] font-bold text-center text-neutral-400 mt-1 uppercase peer-checked:text-[#1f2937]">{star === 5 ? 'Perfect' : star === 1 ? 'Bad' : star}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Your Review</label>
                      <textarea
                        name="comment"
                        required
                        rows={4}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[#1f2937] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:bg-white transition-all resize-none"
                        placeholder="Tell us what you liked or didn't like..."
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-[#1f2937] text-white font-bold rounded-xl hover:bg-[#374151] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <span>Publishing...</span>
                        ) : (
                          <span>Post Review</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
