"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Star, Plus, ArrowRight, Loader2 } from "lucide-react";
import RatingStars from "@/components/books/RatingStars";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogClick?: (book: any) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onLogClick,
}: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectBook = (book: any) => {
    onClose();
    router.push(`/book/${book.slug || book._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl glass-panel border border-white/15 bg-background-card/95 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fadeIn"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-gold shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search thousands of books by title, author, or genre..."
            className="flex-1 bg-transparent text-sm text-parchment-100 placeholder:text-parchment-muted focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-gold animate-spin shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded text-parchment-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-background-elevated border border-white/10 text-[10px] text-parchment-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {results.length > 0 ? (
            results.map((b) => (
              <div
                key={b._id}
                onClick={() => handleSelectBook(b)}
                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group"
              >
                {/* Book cover thumbnail */}
                <div className="w-10 h-15 rounded overflow-hidden shadow-book bg-background-elevated shrink-0 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-parchment-100 group-hover:text-gold transition-colors truncate">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-parchment-muted truncate">
                    {b.author} {b.publishYear ? ` • ${b.publishYear}` : ""}
                  </p>
                  {b.averageRating > 0 && (
                    <div className="mt-0.5">
                      <RatingStars rating={b.averageRating} size="sm" showValue />
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {onLogClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onLogClick(b);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gold/15 hover:bg-gold text-gold hover:text-slate-950 font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Log</span>
                    </button>
                  )}
                  <ArrowRight className="w-4 h-4 text-parchment-muted group-hover:text-gold transition-colors" />
                </div>
              </div>
            ))
          ) : query.trim() && !loading ? (
            <div className="py-12 text-center text-xs text-parchment-muted space-y-2">
              <BookOpen className="w-8 h-8 text-parchment-muted/30 mx-auto" />
              <p>No titles found matching &quot;{query}&quot;</p>
              <p className="text-[11px] text-parchment-muted/70">
                Try searching by author name or book title keyword.
              </p>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-parchment-muted">
              <p>Type to search the Bookmate literary database...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

