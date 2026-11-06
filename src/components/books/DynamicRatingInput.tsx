"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface DynamicRatingInputProps {
  value: number; // 0 to 5 in 0.5 steps
  onChange: (rating: number) => void;
  size?: "md" | "lg";
}

const RATING_DESCRIPTIONS: Record<string, string> = {
  "0.5": "½ — Appalling",
  "1.0": "★ — Poor",
  "1.5": "★½ — Below average",
  "2.0": "★★ — Mediocre",
  "2.5": "★★½ — Decent",
  "3.0": "★★★ — Good",
  "3.5": "★★★½ — Very good",
  "4.0": "★★★★ — Great",
  "4.5": "★★★★½ — Excellent",
  "5.0": "★★★★★ — Masterpiece",
};

export default function DynamicRatingInput({
  value,
  onChange,
  size = "lg",
}: DynamicRatingInputProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSize = size === "lg" ? "w-7 h-7 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6";
  const displayRating = hoverRating !== null ? hoverRating : value;

  const handleStarMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    starIndex: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1.0;
    setHoverRating(newRating);
  };

  const handleStarClick = (
    e: React.MouseEvent<HTMLDivElement>,
    starIndex: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1.0;
    // If clicking same rating, clear to 0
    onChange(value === newRating ? 0 : newRating);
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      <div
        className="flex items-center gap-1 select-none"
        onMouseLeave={() => setHoverRating(null)}
      >
        {Array.from({ length: 5 }).map((_, idx) => {
          const starVal = idx + 1;
          const isFull = displayRating >= starVal;
          const isHalf = !isFull && displayRating >= starVal - 0.5;

          return (
            <div
              key={idx}
              onMouseMove={(e) => handleStarMouseMove(e, idx)}
              onClick={(e) => handleStarClick(e, idx)}
              className="relative cursor-pointer transition-transform hover:scale-115 active:scale-95 p-1"
            >
              {isFull ? (
                <Star className={`${starSize} text-gold fill-gold drop-shadow-md`} />
              ) : isHalf ? (
                <div className="relative">
                  <Star className={`${starSize} text-white/20`} />
                  <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                    <Star className={`${starSize} text-gold fill-gold drop-shadow-md`} />
                  </div>
                </div>
              ) : (
                <Star className={`${starSize} text-white/20 hover:text-white/40 transition-colors`} />
              )}
            </div>
          );
        })}

        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 text-[10px] text-parchment-muted hover:text-red-400 transition-colors underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dynamic text description */}
      <div className="h-4">
        {displayRating > 0 ? (
          <span className="text-xs font-semibold text-gold tracking-wide animate-fadeIn">
            {RATING_DESCRIPTIONS[displayRating.toFixed(1)] || `${displayRating} stars`}
          </span>
        ) : (
          <span className="text-[11px] text-parchment-muted italic">
            Hover & click to rate (half-star precision)
          </span>
        )}
      </div>
    </div>
  );
}
