import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // 0 to 5, can be 3.5, 4.0, etc.
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function RatingStars({
  rating = 0,
  maxStars = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const starSize = sizeClasses[size];

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starVal = idx + 1;
          const isFull = rating >= starVal;
          const isHalf = !isFull && rating >= starVal - 0.5;

          return (
            <span
              key={idx}
              className={`relative ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
              onClick={() => {
                if (interactive && onChange) {
                  // If clicking on existing rating, allow toggle
                  onChange(rating === starVal ? starVal - 0.5 : starVal);
                }
              }}
            >
              {isFull ? (
                <Star className={`${starSize} text-gold fill-gold drop-shadow-sm`} />
              ) : isHalf ? (
                <span className="relative inline-block">
                  <Star className={`${starSize} text-white/20`} />
                  <span className="absolute top-0 left-0 w-1/2 overflow-hidden">
                    <Star className={`${starSize} text-gold fill-gold`} />
                  </span>
                </span>
              ) : (
                <Star className={`${starSize} text-white/15`} />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-gold ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
