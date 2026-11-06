"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookCard from "@/components/books/BookCard";
import RatingStars from "@/components/books/RatingStars";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Trophy,
  Calendar,
  Layers,
  Heart,
  UserPlus,
  UserCheck,
  BarChart3,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${username}`);
      if (res.ok) {
        const json = await res.json();
        setProfileData(json);
        setIsFollowing(json.isFollowing);
        setFollowersCount(json.user.followersCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) fetchProfile();
  }, [username, fetchProfile]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow this member");
      return;
    }

    const prevFollowing = isFollowing;
    const prevCount = followersCount;
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        toast.success(
          data.isFollowing ? `Following @${username}` : `Unfollowed @${username}`
        );
      }
    } catch {
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      toast.error("Failed to update follow status");
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

  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-parchment-100 mb-2">
            Member Not Found
          </h1>
          <p className="text-xs text-parchment-muted mb-6">
            The profile for @{username} does not exist.
          </p>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider"
          >
            Explore Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, stats, recentLogs, isOwnProfile } = profileData;
  const topBooks = user.topBooks || [];

  // Reading challenge calculation
  const challengeYear = user.readingChallengeYear || new Date().getFullYear();
  const challengeGoal = user.readingChallengeGoal || 25;
  const readThisYear = stats.booksReadThisYear || 0;
  const challengePercent = Math.min(
    Math.round((readThisYear / challengeGoal) * 100),
    100
  );

  // Calculate day-of-year pace
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const expectedPace = Math.round((dayOfYear / 365) * challengeGoal);
  const diffPace = readThisYear - expectedPace;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* Profile Header Hero */}
        <div className="p-8 rounded-2xl glass-panel border border-white/10 relative overflow-hidden bg-background-card/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatarUrl || `https://avatar.vercel.sh/${user.username}.png`}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gold/40 shadow-glow"
              />
              <div className="space-y-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-parchment-100">
                  {user.name}
                </h1>
                <p className="text-xs text-parchment-muted font-mono">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-parchment-200 mt-2 max-w-xl font-sans leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-3">
              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isFollowing
                      ? "bg-white/10 text-parchment-200 hover:bg-red-500/20 hover:text-red-300 border border-white/10"
                      : "bg-gold hover:bg-gold-dark text-slate-950 shadow-glow hover:shadow-lg"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              ) : null}

              <Link
                href={`/profile/${user.username}/stats`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background-elevated hover:bg-background-border border border-white/10 text-xs font-bold uppercase tracking-wider text-parchment-200 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-emerald" />
                <span>Stats</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-8 text-xs">
            <div>
              <span className="font-serif text-lg font-bold text-parchment-100">
                {stats.totalBooksLogged}
              </span>{" "}
              <span className="text-parchment-muted">books read</span>
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-parchment-100">
                {stats.totalReviews}
              </span>{" "}
              <span className="text-parchment-muted">reviews</span>
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-parchment-100">
                {stats.totalLists}
              </span>{" "}
              <span className="text-parchment-muted">lists</span>
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-parchment-100">
                {followersCount}
              </span>{" "}
              <span className="text-parchment-muted">followers</span>
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-parchment-100">
                {user.followingCount || 0}
              </span>{" "}
              <span className="text-parchment-muted">following</span>
            </div>
          </div>
        </div>

        {/* ICONIC "TOP 4 FAVORITE BOOKS" SHOWCASE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-parchment-100 tracking-tight">
                Favorite Books
              </h2>
            </div>
            <span className="text-[11px] text-parchment-muted uppercase tracking-wider font-semibold">
              Top 4 Showcase
            </span>
          </div>

          {topBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {topBooks.map((b: any, index: number) => (
                <div key={b._id || index} className="relative group">
                  <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-gold/40 text-[10px] font-bold text-gold">
                    #{index + 1}
                  </div>
                  <BookCard book={b} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl glass-panel border border-white/5 p-6">
              <p className="text-xs text-parchment-muted">
                No favorite books highlighted yet.
              </p>
            </div>
          )}
        </section>

        {/* YEARLY READING CHALLENGE TRACKER */}
        <section className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 space-y-4 bg-background-card/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/25">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif text-xl font-bold text-parchment-100">
                  {challengeYear} Reading Challenge
                </h3>
                <p className="text-xs text-parchment-muted">
                  {readThisYear} of {challengeGoal} books completed ({challengePercent}%)
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  diffPace >= 0
                    ? "bg-emerald/10 border-emerald/30 text-emerald"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                }`}
              >
                {diffPace > 0
                  ? `${diffPace} books ahead of schedule`
                  : diffPace === 0
                  ? "Exactly on pace"
                  : `${Math.abs(diffPace)} books behind schedule`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-background-elevated overflow-hidden border border-white/5 relative">
            <div
              style={{ width: `${challengePercent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-gold rounded-full transition-all duration-500 shadow-glow"
            />
          </div>
        </section>

        {/* RECENT READING DIARY ENTRIES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-parchment-100">
              Recent Diary Entries
            </h2>
            <Link
              href="/diary"
              className="text-xs text-gold hover:underline font-semibold uppercase tracking-wider"
            >
              View Full Diary →
            </Link>
          </div>

          {recentLogs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentLogs.map((log: any) => {
                const book = log.book || {};
                return (
                  <Link
                    key={log._id}
                    href={`/book/${book.slug || book._id}`}
                    className="group space-y-2 block"
                  >
                    <div className="aspect-[2/3] rounded-md overflow-hidden bg-background-elevated shadow-book group-hover:shadow-book-hover transition-all border border-white/10 relative book-spine-effect">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-[11px] space-y-0.5">
                      <p className="font-semibold text-parchment-100 group-hover:text-gold transition-colors line-clamp-1">
                        {book.title}
                      </p>
                      {log.rating && (
                        <RatingStars rating={log.rating} size="sm" />
                      )}
                      <p className="text-[10px] text-parchment-muted font-mono">
                        {formatDate(log.readDate)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-parchment-muted py-8 text-center glass-panel rounded-2xl border border-white/5">
              No recent reads logged yet.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
