// Product gallery with an Amazon-style hover zoom.
//
// Hovering the main image shows a lens over the cursor and a magnified panel
// beside it. Product shots use object-contain rather than object-cover so
// nothing is cropped out of frame - important when the photo carries text.
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ZOOM = 2.2; // magnification in the zoom panel
// The panel shows 1/ZOOM of the image, so the lens must be exactly that
// fraction of the image box for the two to line up.
const LENS = 100 / ZOOM;

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const boxRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    // Clamp so the lens can't hang off the edges of the image.
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setPos({ x, y });
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden ring-1 ring-gray-200">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Image
        </div>
      </div>
    );
  }

  const current = images[selectedImage];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* THUMBNAILS - only when there is more than one image. */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 md:max-h-[520px] scrollbar-hide py-1 px-1">
          {images.map((img, i) => (
            <button
              key={i}
              onMouseEnter={() => setSelectedImage(i)}
              onClick={() => setSelectedImage(i)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === i
                  ? "border-accent shadow-md shadow-accent/20"
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* MAIN IMAGE + ZOOM. The wrapper is relative (and not clipped) so the
          zoom panel can sit outside the image box. */}
      <div className="relative flex-1">
        <div
          ref={boxRef}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMove}
          className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100 cursor-crosshair"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative"
            >
              <img
                src={current}
                alt={productName}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {/* Lens: hidden on touch layouts, where there is no hover. */}
          {zooming && (
            <div
              className="hidden md:block pointer-events-none absolute border-2 border-neutral-400/70 bg-white/25 rounded"
              style={{
                width: `${LENS}%`,
                height: `${LENS}%`,
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>

        {/* ZOOM PANEL - overlays the column to the right, like Amazon.
            It renders the same <img> with the same object-contain fit and
            simply scales it about the cursor, so the magnified view lines up
            with the lens exactly. A background-image + background-position
            panel drifts out of sync, because the letterboxing from
            object-contain is not reproduced by background-size. */}
        {zooming && (
          <div className="hidden md:block absolute top-0 left-[calc(100%+1rem)] w-[420px] lg:w-[520px] aspect-square bg-white rounded-2xl ring-1 ring-gray-200 shadow-2xl z-40 overflow-hidden">
            <img
              src={current}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                transform: `scale(${ZOOM})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
