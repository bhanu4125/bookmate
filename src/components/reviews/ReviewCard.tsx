"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, AlertTriangle, Send, CornerDownRight } from "lucide-react";
import RatingStars from "@/components/books/RatingStars";
import { formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export interface ReviewCardData {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  book?: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
    slug?: string;
  };
  rating?: number;
  content: string;
  containsSpoilers: boolean;
  likes: string[];
  comments?: {
    _id: string;
    user: {
      _id: string;
      name: string;
      username: string;
      avatarUrl?: string;
    };
    content: string;
    createdAt: string;
  }[];
  quotes?: string[];
  createdAt: string;
}

interface ReviewCardProps {
  review: ReviewCardData;
  showBookInfo?: boolean;
}

export default function ReviewCard({ review, showBookInfo = false }: ReviewCardProps) {
  const { user } = useAuth();
  const [spoilerRevealed, setSpoilerRevealed] = useState(!review.containsSpoilers);
  const [likesCount, setLikesCount] = useState(review.likes?.length || 0);
  const [hasLiked, setHasLiked] = useState(
    user ? review.likes?.includes(user.id) : false
  );
  const [isLiking, setIsLiking] = useState(false);

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(review.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to like reviews");
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const nextLiked = !hasLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(likesCount - 1, 0);

    setHasLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      // Pop confetti around button
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { x, y },
        colors: ["#ef4444", "#f59e0b", "#e6edf3"],
      });
    }

    try {
      const res = await fetch(`/api/reviews/${review._id}/like`, { method: "POST" });
      if (!res.ok) {
        setHasLiked(!nextLiked);
        setLikesCount(likesCount);
      }
    } catch {
      setHasLiked(!nextLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to post comments");
      return;
    }

    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/reviews/${review._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewCommentText("");
        toast.success("Comment posted!");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 hover:border-white/20 transition-all duration-200">
      {/* Optional book banner header if rendering on an activity feed */}
      {showBookInfo && review.book && (
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.book.coverImage}
            alt={review.book.title}
            className="w-8 h-12 object-cover rounded shadow border border-white/10"
          />
          <div>
            <Link
              href={`/book/${review.book.slug || review.book._id}`}
              className="text-xs font-bold text-parchment-100 hover:text-gold transition-colors line-clamp-1"
            >
              {review.book.title}
            </Link>
            <p className="text-[11px] text-parchment-muted">{review.book.author}</p>
          </div>
        </div>
      )}

      {/* Reviewer Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${review.user?.username}`}
          className="flex items-center gap-3 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              review.user?.avatarUrl ||
              `https://avatar.vercel.sh/${review.user?.username}.png`
            }
            alt={review.user?.name}
            className="w-10 h-10 rounded-full object-cover border border-white/15"
          />
          <div>
            <p className="text-sm font-semibold text-parchment-100 group-hover:text-gold transition-colors">
              {review.user?.name}
            </p>
            <p className="text-[11px] text-parchment-muted">
              @{review.user?.username} • {formatRelativeTime(review.createdAt)}
            </p>
          </div>
        </Link>

        {review.rating && <RatingStars rating={review.rating} size="sm" showValue />}
      </div>

      {/* Spoiler Veil Alert */}
      {review.containsSpoilers && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>This review contains spoilers.</span>
          </div>
          <button
            type="button"
            onClick={() => setSpoilerRevealed(!spoilerRevealed)}
            className="font-bold underline text-amber-200 hover:text-white transition-colors"
          >
            {spoilerRevealed ? "Hide spoilers" : "Reveal spoilers"}
          </button>
        </div>
      )}

      {/* Review Text Body */}
      <div
        className={`text-sm text-parchment-200 leading-relaxed font-sans whitespace-pre-line transition-all duration-300 ${
          review.containsSpoilers && !spoilerRevealed
            ? "filter blur-md select-none opacity-40 max-h-24 overflow-hidden"
            : ""
        }`}
      >
        {review.content}
      </div>

      {/* Quote Highlight */}
      {review.quotes && review.quotes.length > 0 && (
        <div className="border-l-2 border-gold pl-4 py-1.5 italic text-xs text-parchment-muted font-serif bg-gold/[0.02] rounded-r-lg">
          “{review.quotes[0]}”
        </div>
      )}

      {/* Actions footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-parchment-muted">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors group ${
            hasLiked ? "text-red-400 font-bold" : "hover:text-red-400"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              hasLiked ? "fill-red-400 text-red-400" : ""
            }`}
          />
          <span>{likesCount} Likes</span>
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 hover:text-parchment-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{comments.length} Comments</span>
        </button>
      </div>

      {/* Expandable Comment Thread */}
      {commentsOpen && (
        <div className="pt-4 mt-3 border-t border-white/5 space-y-4 animate-fadeIn">
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((c: any) => (
                <div key={c._id} className="flex gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.user?.avatarUrl || `https://avatar.vercel.sh/${c.user?.username}.png`}
                    alt={c.user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-parchment-200">
                        {c.user?.name}
                      </span>
                      <span className="text-[10px] text-parchment-muted">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-parchment-muted leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-parchment-muted text-center py-2">
              No comments yet. Start the conversation!
            </p>
          )}

          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newCommentText.trim()}
              className="px-3.5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
