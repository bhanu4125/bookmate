"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RatingStars from "@/components/books/RatingStars";
import { useAuth } from "@/context/AuthContext";
import {
  Layers,
  Heart,
  Copy,
  BookOpen,
  Share2,
  Calendar,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

export default function ListDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.list);
        setLikesCount(json.list?.likes?.length || 0);
        setHasLiked(json.hasLiked || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchList();
  }, [slug, fetchList]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like lists");
      return;
    }

    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikesCount(nextLiked ? likesCount + 1 : Math.max(likesCount - 1, 0));

    try {
      await fetch(`/api/lists/${data._id}/like`, { method: "POST" });
    } catch {
      setHasLiked(!nextLiked);
      setLikesCount(likesCount);
    }
  };

  const handleClone = async () => {
    if (!user) {
      toast.error("Please sign in to clone this list");
      return;
    }

    setIsCloning(true);
    try {
      const res = await fetch(`/api/lists/${data._id}/clone`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        toast.success("List cloned to your profile!");
        router.push(`/lists/${json.list.slug}`);
      }
    } catch {
      toast.error("Failed to clone list");
    } finally {
      setIsCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <Layers className="w-12 h-12 text-parchment-muted mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-parchment-100 mb-2">
            List Not Found
          </h1>
          <p className="text-xs text-parchment-muted mb-6">
            This collection may have been removed or set to private.
          </p>
          <Link
            href="/lists"
            className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider"
          >
            Explore Other Lists
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* List Header */}
        <div className="p-8 rounded-2xl glass-panel border border-white/10 space-y-6 relative overflow-hidden bg-background-card/90">
          <div className="absolute inset-0 ambient-glow opacity-30 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {data.isRanked && (
                  <span className="px-2.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 text-[10px] font-bold uppercase tracking-wider">
                    Ranked
                  </span>
                )}
                <span className="text-xs text-parchment-muted">
                  {data.books?.length || 0} books
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
                {data.title}
              </h1>
              {data.description && (
                <p className="text-sm text-parchment-200 font-sans leading-relaxed max-w-2xl">
                  {data.description}
                </p>
              )}
            </div>

            {/* Actions: Like & Clone */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                  hasLiked
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-background-elevated border-white/10 text-parchment-muted hover:text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-400" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <button
                type="button"
                disabled={isCloning}
                onClick={handleClone}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background-elevated hover:bg-background-border border border-white/10 text-xs font-bold uppercase tracking-wider text-parchment-200 transition-colors"
                title="Clone this shelf to your profile"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Clone</span>
              </button>
            </div>
          </div>

          {/* Author attribution */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
            <Link
              href={`/profile/${data.user?.username}`}
              className="flex items-center gap-2.5 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.user?.avatarUrl || `https://avatar.vercel.sh/${data.user?.username}.png`}
                alt={data.user?.name}
                className="w-8 h-8 rounded-full object-cover border border-white/15"
              />
              <span className="text-xs font-semibold text-parchment-200 group-hover:text-gold transition-colors">
                Curated by {data.user?.name} (@{data.user?.username})
              </span>
            </Link>
          </div>
        </div>

        {/* Books List Entries */}
        <div className="space-y-4">
          {data.books?.map((entry: any, idx: number) => {
            const book = entry.book || {};
            const rank = entry.order || idx + 1;

            return (
              <div
                key={book._id || idx}
                className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl glass-panel border border-white/5 hover:border-white/15 transition-colors bg-background-card/60"
              >
                {/* Rank number (if ranked list) */}
                {data.isRanked && (
                  <div className="text-xl sm:text-2xl font-serif font-bold text-gold/70 w-8 text-center shrink-0">
                    #{rank}
                  </div>
                )}

                {/* Book Cover */}
                <Link
                  href={`/book/${book.slug || book._id}`}
                  className="shrink-0 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded shadow border border-white/10 group-hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Info & Notes */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <Link
                      href={`/book/${book.slug || book._id}`}
                      className="font-serif text-lg font-bold text-parchment-100 hover:text-gold transition-colors line-clamp-1"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-parchment-muted">
                      {book.author} {book.publishYear ? ` • ${book.publishYear}` : ""}
                    </p>
                  </div>

                  {book.averageRating > 0 && (
                    <RatingStars rating={book.averageRating} size="sm" showValue />
                  )}

                  {/* Curator custom note for this book */}
                  {entry.note && (
                    <div className="p-3 rounded-xl bg-background-elevated/60 border border-white/5 text-xs text-parchment-200 italic font-sans leading-relaxed">
                      “{entry.note}”
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
