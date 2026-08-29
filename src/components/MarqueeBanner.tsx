import React from "react";

const MarqueeBanner = ({ items: itemsProp }: { items?: string[] }) => {
  const items = itemsProp && itemsProp.length
    ? itemsProp
    : ["New Drop Available", "Limited Stock", "Free Shipping on Orders Over ₹999"];

  return (
    <div className="bg-[#623903] text-white overflow-hidden py-2 relative z-50">
      <div className="flex w-max whitespace-nowrap animate-marquee">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center mx-4">
            {items.map((text, index) => (
              <span key={index} className="mx-4 text-xs font-bold tracking-[0.2em] uppercase flex items-center">
                {text}
                <span className="ml-8 text-yellow-500">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
