"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export interface RatingHistogramData {
  "0.5": number;
  "1.0": number;
  "1.5": number;
  "2.0": number;
  "2.5": number;
  "3.0": number;
  "3.5": number;
  "4.0": number;
  "4.5": number;
  "5.0": number;
}

interface RatingHistogramProps {
  distribution: RatingHistogramData;
  averageRating: number;
  ratingsCount: number;
}

const RATING_KEYS: (keyof RatingHistogramData)[] = [
  "0.5",
  "1.0",
  "1.5",
  "2.0",
  "2.5",
  "3.0",
  "3.5",
  "4.0",
  "4.5",
  "5.0",
];

export default function RatingHistogram({
  distribution,
  averageRating,
  ratingsCount,
}: RatingHistogramProps) {
  const [hoveredKey, setHoveredKey] = useState<keyof RatingHistogramData | null>(null);

  const maxCount = Math.max(...RATING_KEYS.map((k) => distribution[k] || 0), 1);

  return (
    <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-parchment-muted font-bold font-sans">
            Ratings Distribution
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-serif text-parchment-100">
              {averageRating ? averageRating.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-parchment-muted">
              from {ratingsCount.toLocaleString()} {ratingsCount === 1 ? "reader" : "readers"}
            </span>
          </div>
        </div>

        {/* Hovered bar info pill */}
        <div className="h-6">
          {hoveredKey && (
            <span className="px-2.5 py-1 rounded bg-background-elevated border border-white/10 text-[11px] text-gold font-medium animate-fadeIn">
              ★ {hoveredKey}: {distribution[hoveredKey].toLocaleString()} ratings (
              {ratingsCount > 0
                ? Math.round((distribution[hoveredKey] / ratingsCount) * 100)
                : 0}
              %)
            </span>
          )}
        </div>
      </div>

      {/* 10-Bar Letterboxd Style Chart */}
      <div className="pt-2">
        <div className="flex items-end gap-1.5 h-24 w-full px-1">
          {RATING_KEYS.map((key) => {
            const count = distribution[key] || 0;
            const heightPercent = Math.max(Math.round((count / maxCount) * 100), 4);
            const isHovered = hoveredKey === key;

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div className="w-full relative flex items-end justify-center">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      isHovered
                        ? "bg-gold shadow-glow"
                        : "bg-parchment-muted/30 group-hover:bg-gold/70"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Axis Labels */}
        <div className="flex justify-between items-center text-[10px] text-parchment-muted/70 pt-2 px-1 border-t border-white/5 mt-1 font-mono">
          <span>½ ★</span>
          <span>3 ★</span>
          <span>5 ★</span>
        </div>
      </div>
    </div>
  );
}
