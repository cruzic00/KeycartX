// Port of components/ProductGallery.tsx. `next/image` `fill` usages become
// plain `<img>` with absolute inset-0 object-cover per the conversion rules.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Fallback if images array is empty (shouldn't happen with correct logic)
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden ring-1 ring-gray-200">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* THUMBNAILS — only when there is more than one image. */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 md:max-h-[600px] scrollbar-hide py-1 px-1">
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

      {/* MAIN IMAGE */}
      <div className="relative flex-1 aspect-[3/4] md:aspect-square bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100">
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
              src={images[selectedImage]}
              alt={productName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
