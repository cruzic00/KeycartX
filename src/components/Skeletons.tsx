// Loading placeholders.
//
// These routes fetch after mount, and used to render null while waiting -
// which collapsed the page to nav + footer, so the footer flew up under the
// header for a second and then got shoved back down when the data landed.
// Holding roughly the real layout's shape keeps the page still.
function Block({ className = "" }: { className?: string }) {
  return <div className={`bg-neutral-200 rounded ${className}`} />;
}

export function ProductDetailSkeleton() {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen animate-pulse">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <section className="grid gap-10 md:grid-cols-2 pt-1 pb-12">
          {/* gallery: thumbnail rail + square main image */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 md:w-20">
              {Array.from({ length: 4 }).map((_, i) => (
                <Block key={i} className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg" />
              ))}
            </div>
            <Block className="flex-1 aspect-square rounded-2xl" />
          </div>

          {/* details column */}
          <div className="space-y-6">
            <div>
              <Block className="h-9 w-3/4 mb-3" />
              <Block className="h-4 w-40 mb-4" />
              <Block className="h-9 w-48 mb-4" />
              <Block className="h-4 w-full mb-2" />
              <Block className="h-4 w-5/6" />
            </div>
            <Block className="h-11 w-40 rounded-lg" />
            <Block className="h-14 w-full rounded-lg" />
            <div className="flex gap-4 py-4 border-y border-neutral-100">
              <Block className="h-6 w-32" />
              <Block className="h-6 w-44" />
            </div>
            <Block className="h-32 w-full rounded-lg" />
          </div>
        </section>

        {/* The real page continues with reviews and related products. Without
            these the placeholder is far shorter than what replaces it, and
            the footer still travels a few hundred pixels on load. */}
        <section className="pb-12 pt-16 border-t border-neutral-100">
          <Block className="h-10 w-72 mb-4" />
          <Block className="h-16 w-56 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Block key={i} className="h-48 w-full rounded-3xl" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* hero carousel */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 w-screen h-[80vh] bg-neutral-200" />

      <div className="py-12">
        <Block className="h-8 w-56 mx-auto mb-3" />
        <Block className="h-4 w-72 mx-auto mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Block className="aspect-square w-full rounded-xl mb-3" />
              <Block className="h-4 w-3/4 mb-2" />
              <Block className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
