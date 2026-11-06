"use client";

import { useState, useEffect } from "react";
import { X, Calendar, BookOpen, Star, Sparkles, Tag, Check, Bookmark } from "lucide-react";
import DynamicRatingInput from "@/components/books/DynamicRatingInput";
import { BookFormat, ReadingStatus } from "@/types";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  initialData?: {
    rating?: number;
    status?: ReadingStatus;
    format?: BookFormat;
    readDate?: string;
    isReread?: boolean;
    notes?: string;
    reviewContent?: string;
    containsSpoilers?: boolean;
    quote?: string;
    tags?: string[];
  };
  onSuccess?: () => void;
}

const FORMAT_OPTIONS: BookFormat[] = [
  "Paperback",
  "Hardcover",
  "Kindle / E-Book",
  "Audiobook",
];

export default function LogModal({
  isOpen,
  onClose,
  book,
  initialData,
  onSuccess,
}: LogModalProps) {
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [status, setStatus] = useState<ReadingStatus>(initialData?.status || "read");
  const [format, setFormat] = useState<BookFormat>(initialData?.format || "Paperback");
  const [readDate, setReadDate] = useState<string>(
    initialData?.readDate || new Date().toISOString().split("T")[0]
  );
  const [isReread, setIsReread] = useState<boolean>(initialData?.isReread || false);
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [reviewContent, setReviewContent] = useState<string>(
    initialData?.reviewContent || ""
  );
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(
    initialData?.containsSpoilers || false
  );
  const [quote, setQuote] = useState<string>(initialData?.quote || "");
  const [tagsInput, setTagsInput] = useState<string>(
    initialData?.tags?.join(", ") || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.rating !== undefined) setRating(initialData.rating);
      if (initialData.status) setStatus(initialData.status);
      if (initialData.format) setFormat(initialData.format);
      if (initialData.readDate) setReadDate(initialData.readDate);
      if (initialData.isReread !== undefined) setIsReread(initialData.isReread);
      if (initialData.notes) setNotes(initialData.notes);
      if (initialData.reviewContent) setReviewContent(initialData.reviewContent);
      if (initialData.containsSpoilers !== undefined)
        setContainsSpoilers(initialData.containsSpoilers);
      if (initialData.quote) setQuote(initialData.quote);
      if (initialData.tags) setTagsInput(initialData.tags.join(", "));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // 1. Submit review if content provided
      let reviewId = undefined;
      if (reviewContent.trim()) {
        const revRes = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: book._id,
            rating: rating > 0 ? rating : undefined,
            content: reviewContent,
            containsSpoilers,
            quotes: quote.trim() ? [quote.trim()] : [],
          }),
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          reviewId = revData.review?._id;
        }
      }

      // 2. Submit diary reading log
      const logRes = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book._id,
          status,
          rating: rating > 0 ? rating : undefined,
          format,
          isReread,
          notes,
          tags: parsedTags,
          readDate,
          reviewId,
        }),
      });

      if (!logRes.ok) {
        throw new Error("Failed to save reading log");
      }

      // Confetti burst on successful log!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#e6edf3"],
      });

      toast.success(`Logged "${book.title}" in your reading diary!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to log entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-2xl glass-panel border border-white/15 p-6 sm:p-8 shadow-2xl bg-background-card/95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
              The Reading Diary
            </span>
            <h2 className="font-serif text-2xl font-bold text-parchment-100">
              Log or Review Book
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-parchment-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book summary */}
        {book && (
          <div className="flex items-center gap-4 py-4 border-b border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-12 h-18 object-cover rounded shadow border border-white/10"
            />
            <div>
              <h3 className="font-serif text-base font-bold text-parchment-100 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-xs text-parchment-muted">{book.author}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-2">
              Rating
            </label>
            <DynamicRatingInput value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Date read & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1.5">
                Date Finished / Read
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
                <input
                  type="date"
                  value={readDate}
                  onChange={(e) => setReadDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1.5">
                Edition / Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BookFormat)}
                className="w-full px-3 py-2 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 focus:outline-none focus:border-gold"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f} value={f} className="bg-background-card">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Re-read toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-background-elevated border border-white/5">
            <span className="text-xs text-parchment-200 font-medium">
              I have read this book before (Re-read)
            </span>
            <input
              type="checkbox"
              checked={isReread}
              onChange={(e) => setIsReread(e.target.checked)}
              className="w-4 h-4 rounded text-gold focus:ring-gold bg-background-card border-white/20 cursor-pointer"
            />
          </div>

          {/* Review text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-parchment-300 uppercase tracking-wider">
                Review (Optional)
              </label>
              <span className="text-[11px] text-parchment-muted">Markdown enabled</span>
            </div>
            <textarea
              rows={4}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="What made this memorable? Write your thoughts, reflections, or critical analysis..."
              className="w-full p-3 rounded-xl bg-background-elevated border border-background-border text-xs sm:text-sm text-parchment-100 focus:outline-none focus:border-gold transition-colors leading-relaxed"
            />
          </div>

          {/* Spoiler Veil Checkbox & Quote */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="spoilers"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="w-4 h-4 rounded text-gold focus:ring-gold bg-background-card border-white/20 cursor-pointer"
              />
              <label htmlFor="spoilers" className="text-xs text-parchment-300 cursor-pointer">
                This review contains spoilers (veil review for others)
              </label>
            </div>

            <div>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Highlight a favorite quote from this book..."
                className="w-full px-3 py-2 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 italic focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1.5">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-parchment-muted" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="favorites, autumn-read, campus-novel, 2026-reads"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-parchment-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save to Diary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
