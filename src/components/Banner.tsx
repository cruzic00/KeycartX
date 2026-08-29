import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  durationMs?: number;
  type?: "image" | "video";
};

export default function Banner({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  };

  const s = slides[index];

  const isVideo = useMemo(() => {
    if (s?.type) return s.type === "video";
    return /\.(mp4|webm|ogg)$/i.test(s?.src || "");
  }, [s]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const v = videoRef.current;

    if (isVideo && v) {
      try {
        v.currentTime = 0;
        v.play().catch(() => {});
      } catch {}
      const onEnded = () => go(1);
      v.addEventListener("ended", onEnded);
      return () => v.removeEventListener("ended", onEnded);
    }

    const timer = setTimeout(() => go(1), 5000);
    return () => clearTimeout(timer);
  }, [index, isVideo]);

  if (!s) return null;

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 w-screen h-[80vh] bg-[#1f2937] group overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {slide.type === "video" || slide.src.match(/\.(mp4|webm)$/i) ? (
            <video
              ref={i === index ? videoRef : undefined}
              src={slide.src}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={slide.src}
                alt={slide.alt || ""}
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      ))}

      {(s.title || s.subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
          <div className="relative">
            {s.title && (
              <h2
                className="text-6xl md:text-9xl font-black uppercase leading-none tracking-tighter text-transparent select-none animate-in slide-in-from-bottom-10 fade-in duration-1000"
                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.8)" }}
              >
                {s.title}
              </h2>
            )}
            {s.title && (
              <h2 className="absolute inset-0 text-6xl md:text-9xl font-black uppercase leading-none tracking-tighter text-white/5 blur-sm select-none pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-100">
                {s.title}
              </h2>
            )}
          </div>

          {s.subtitle && (
            <div className="mt-6 overflow-hidden">
              <p className="text-white text-sm md:text-xl font-bold tracking-[0.5em] uppercase bg-black/80 px-5 py-2 inline-block backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-300">
                {s.subtitle}
              </p>
            </div>
          )}

          <Link
            to="/products"
            className="mt-10 inline-block px-12 py-4 bg-white text-[#1f2937] text-sm font-black uppercase tracking-widest hover:bg-neutral-200 hover:scale-105 transition-all duration-300 animate-in zoom-in fade-in duration-1000 delay-500"
          >
            Shop The Collection
          </Link>
        </div>
      )}

      <button
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 text-white/30 hover:text-white transition-colors hover:scale-110"
      >
        <span className="text-6xl font-thin">‹</span>
      </button>

      <button
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 text-white/30 hover:text-white transition-colors hover:scale-110"
      >
        <span className="text-6xl font-thin">›</span>
      </button>

      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-[2px] transition-all duration-300 ${i === index ? "w-16 bg-white" : "w-8 bg-white/30 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
