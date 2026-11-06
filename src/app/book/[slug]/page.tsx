"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RatingHistogram from "@/components/books/RatingHistogram";
import RatingStars from "@/components/books/RatingStars";
import DynamicRatingInput from "@/components/books/DynamicRatingInput";
import ReadingStatusToggle from "@/components/books/ReadingStatusToggle";
import ReviewCard from "@/components/reviews/ReviewCard";
import { ReadingStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Calendar,
  Layers,
  Heart,
  Share2,
  Bookmark,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

export default function BookDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [userRating, setUserRating] = useState<number>(0);
  const [userStatus, setUserStatus] = useState<ReadingStatus | null>(null);

  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`/api/books/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.userActivity) {
          setUserRating(json.userActivity.rating || 0);
          setUserStatus(json.userActivity.status || null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const handleStatusChange = async (newStatus: ReadingStatus) => {
    if (!user) {
      toast.error("Please sign in to log your reading status");
      return;
    }

    const previous = userStatus;
    setUserStatus(newStatus);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: data.book._id,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        setUserStatus(previous);
        toast.error("Failed to update status");
      } else {
        toast.success(`Marked as ${newStatus.replace(/-/g, " ")}`);
      }
    } catch {
      setUserStatus(previous);
      toast.error("Failed to update status");
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!user) {
      toast.error("Please sign in to rate this book");
      return;
    }

    const prev = userRating;
    setUserRating(newRating);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: data.book._id,
          rating: newRating,
        }),
      });

      if (!res.ok) {
        setUserRating(prev);
        toast.error("Failed to record rating");
      } else {
        toast.success(newRating > 0 ? `Rated ${newRating} stars!` : "Rating cleared");
        fetchBook();
      }
    } catch {
      setUserRating(prev);
      toast.error("Failed to record rating");
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBook();
    }
  }, [slug, fetchBook]);

  const toggleSpoiler = (reviewId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      toast.error("Please sign in to like reviews");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" });
      if (res.ok) {
        toast.success("Review liked!");
        fetchBook();
      }
    } catch {
      toast.error("Failed to like review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!data || !data.book) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <BookOpen className="w-12 h-12 text-parchment-muted mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-parchment-100 mb-2">Book Not Found</h1>
          <p className="text-sm text-parchment-muted mb-6">We couldn’t locate this title in our catalog.</p>
          <Link href="/explore" className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider">
            Explore All Books
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { book, reviews, lists, userActivity } = data;

  return (
    <div className="min-h-screen bg-background flex flex-col relative selection:bg-gold selection:text-black">
      <Navbar />

      {/* Cinematic Ambient Glow Header Backdrop */}
      <div className="relative w-full overflow-hidden border-b border-white/5 bg-background-subtle">
        <div
          className="absolute inset-0 opacity-20 filter blur-3xl scale-125 pointer-events-none"
          style={{
            backgroundImage: `url(${book.coverImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Book Cover Column */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-56 sm:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-book-hover border border-white/15 relative book-spine-effect"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Book Metadata & Title Info */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {book.genres?.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-parchment-300"
                    >
                      {genre}
                    </span>
                  ))}
                  {book.publishYear && (
                    <span className="text-xs text-parchment-muted font-sans">
                      {book.publishYear}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-parchment-100 tracking-tight leading-tight">
                  {book.title}
                </h1>
                <p className="text-base sm:text-lg text-parchment-muted mt-1 font-sans">
                  By <span className="text-parchment-200 font-semibold">{book.author}</span>
                </p>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap items-center gap-6 py-3 border-y border-white/10 text-xs text-parchment-300">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={book.averageRating || 0} size="md" showValue />
                  <span className="text-parchment-muted text-[11px]">
                    ({book.ratingsCount || 0} reviews)
                  </span>
                </div>
                {book.pageCount ? (
                  <div>
                    <span className="font-semibold text-parchment-100">{book.pageCount}</span>{" "}
                    <span className="text-parchment-muted">pages</span>
                  </div>
                ) : null}
                {book.publisher && (
                  <div>
                    <span className="text-parchment-muted">Publisher:</span>{" "}
                    <span className="font-semibold text-parchment-200">{book.publisher}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="hidden sm:block">
                    <span className="text-parchment-muted">ISBN:</span>{" "}
                    <span className="font-mono text-parchment-300">{book.isbn}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-parchment-muted font-sans">
                  Synopsis
                </h3>
                <p className="text-sm leading-relaxed text-parchment-200 font-sans max-w-3xl whitespace-pre-line">
                  {book.description || `Read reviews, log reading dates, and track ${book.title} by ${book.author} on Bookmate.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Stats, Reviews, and Lists */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Community Reviews & Discussions */}
          <div className="lg:col-span-8 space-y-10">
            {/* Reviews Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold" />
                  <h2 className="font-serif text-2xl font-bold text-parchment-100">
                    Community Reviews
                  </h2>
                </div>
                <span className="text-xs text-parchment-muted">
                  {reviews?.length || 0} {reviews?.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((rev: any) => (
                    <ReviewCard key={rev._id} review={rev} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-2xl glass-panel border border-white/5 p-8">
                  <p className="text-sm text-parchment-muted">
                    No community reviews written yet. Be the first to review this book!
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Your Activity, Rating Histogram & Featured Lists */}
          <div className="lg:col-span-4 space-y-8">
            {/* "YOUR ACTIVITY" LETTERBOXD-STYLE PANEL */}
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-5 bg-background-card/80">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs uppercase tracking-wider text-parchment-muted font-bold font-sans">
                  Your Activity
                </span>
                {user ? (
                  <span className="text-[11px] text-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                  </span>
                ) : (
                  <Link href="/login" className="text-[11px] text-gold hover:underline">
                    Sign in to log
                  </Link>
                )}
              </div>

              {/* Status Toggle */}
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-parchment-muted font-sans font-semibold">
                  Reading Status
                </p>
                <ReadingStatusToggle
                  currentStatus={userStatus}
                  onChange={handleStatusChange}
                  disabled={!user}
                />
              </div>

              {/* Dynamic Half-Star Rating Input */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[11px] uppercase tracking-wider text-parchment-muted font-sans font-semibold">
                  Your Rating
                </p>
                <DynamicRatingInput
                  value={userRating}
                  onChange={handleRatingChange}
                  size="lg"
                />
              </div>

              {/* Log/Review deep dive link */}
              <Link
                href={`/book/${book.slug || book._id}/log`}
                className="w-full py-2.5 rounded-xl bg-background-elevated hover:bg-background-border border border-white/10 text-parchment-100 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Write Full Review / Diary Log</span>
              </Link>
            </div>

            {/* Letterboxd-style Rating Histogram */}
            <RatingHistogram
              distribution={
                book.ratingDistribution || {
                  "0.5": 2,
                  "1.0": 5,
                  "1.5": 4,
                  "2.0": 10,
                  "2.5": 14,
                  "3.0": 28,
                  "3.5": 42,
                  "4.0": 85,
                  "4.5": 92,
                  "5.0": 120,
                }
              }
              averageRating={book.averageRating || 4.2}
              ratingsCount={book.ratingsCount || 402}
            />

            {/* Custom Lists Featuring This Book */}
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-parchment-muted font-bold font-sans">
                  Featured in User Lists
                </span>
                <Layers className="w-4 h-4 text-parchment-muted" />
              </div>

              {lists && lists.length > 0 ? (
                <div className="space-y-3">
                  {lists.map((lst: any) => (
                    <Link
                      key={lst._id}
                      href={`/lists/${lst.slug}`}
                      className="block p-3 rounded-xl bg-background-elevated hover:bg-background-border border border-white/5 transition-colors group"
                    >
                      <p className="text-xs font-semibold text-parchment-100 group-hover:text-gold transition-colors truncate">
                        {lst.title}
                      </p>
                      <p className="text-[11px] text-parchment-muted mt-1 truncate">
                        by @{lst.user?.username} • {lst.books?.length || 0} books
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-parchment-muted">
                  Not included in any public lists yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
