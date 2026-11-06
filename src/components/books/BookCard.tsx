"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, Check, Eye, Plus, Star } from "lucide-react";
import RatingStars from "./RatingStars";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface BookCardData {
  _id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  publishYear?: number;
  averageRating?: number;
  ratingsCount?: number;
  genres?: string[];
  rank?: number;
}

interface BookCardProps {
  book: BookCardData;
  onLogClick?: (book: BookCardData) => void;
  priority?: boolean;
}

export default function BookCard({ book, onLogClick }: BookCardProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleQuickWantToRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save books to your watchlist");
      return;
    }

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book._id,
          status: isSaved ? "read" : "want-to-read",
        }),
      });

      if (res.ok) {
        setIsSaved(!isSaved);
        toast.success(
          !isSaved
            ? `Added "${book.title}" to Want to Read`
            : `Removed "${book.title}" from watchlist`
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleQuickLog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLogClick) {
      onLogClick(book);
    } else {
      window.location.href = `/book/${book.slug || book._id}?log=true`;
    }
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/book/${book.slug || book._id}`} className="block relative">
        {/* Book Jacket Container with 3D perspective */}
        <motion.div
          whileHover={{
            scale: 1.03,
            rotateY: -4,
            transition: { duration: 0.25, ease: "easeOut" },
          }}
          style={{ perspective: 1000 }}
          className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-background-elevated shadow-book group-hover:shadow-book-hover transition-all duration-300 border border-white/10"
        >
          {/* Book Spine Texture Overlay */}
          <div className="book-spine-effect absolute inset-0 z-10 pointer-events-none" />

          {/* Book Cover Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Optional Rank Badge (for lists or top books) */}
          {book.rank !== undefined && (
            <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-gold font-sans shadow-md">
              #{book.rank}
            </div>
          )}

          {/* Hover Overlay with Quick Actions */}
          <div
            className={`absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 flex flex-col justify-between transition-opacity duration-200 ${
              isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Top row actions */}
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={handleQuickWantToRead}
                title={isSaved ? "Saved to Want to Read" : "Want to Read"}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${
                  isSaved
                    ? "bg-emerald text-white shadow-glow-emerald"
                    : "bg-white/15 text-parchment-200 hover:bg-white/25 hover:text-white"
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Bottom info & Quick Log CTA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-parchment-200">
                <RatingStars rating={book.averageRating || 0} size="sm" showValue />
              </div>

              <button
                type="button"
                onClick={handleQuickLog}
                className="w-full py-2 rounded-lg bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log / Review</span>
              </button>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Book Metadata below cover */}
      <div className="mt-2.5 space-y-0.5">
        <Link
          href={`/book/${book.slug || book._id}`}
          className="block font-medium text-xs sm:text-sm text-parchment-100 hover:text-gold line-clamp-1 transition-colors leading-snug"
          title={book.title}
        >
          {book.title}
        </Link>
        <p className="text-[11px] text-parchment-muted line-clamp-1">
          {book.author}
          {book.publishYear ? ` • ${book.publishYear}` : ""}
        </p>
      </div>
    </div>
  );
}
