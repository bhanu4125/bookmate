"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReviewCard from "@/components/reviews/ReviewCard";
import { useAuth } from "@/context/AuthContext";
import { Users, Sparkles, UserPlus, UserCheck, Flame, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function ActivityPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "following">("all");
  const [activities, setActivities] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setSuggestedUsers(data.suggestedUsers || []);

        if (user) {
          const map: Record<string, boolean> = {};
          data.suggestedUsers?.forEach((u: any) => {
            const isFol = u.followers?.some((fid: any) => fid.toString() === user.id);
            map[u.username] = isFol;
          });
          setFollowingMap(map);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleFollowToggle = async (username: string) => {
    if (!user) {
      toast.error("Please sign in to follow members");
      return;
    }

    const currentStatus = !!followingMap[username];
    setFollowingMap((prev) => ({ ...prev, [username]: !currentStatus }));

    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFollowingMap((prev) => ({ ...prev, [username]: data.isFollowing }));
        toast.success(data.isFollowing ? `Followed @${username}` : `Unfollowed @${username}`);
        fetchFeed();
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [username]: currentStatus }));
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header and Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              Community Pulse
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
              Activity Stream
            </h1>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-background-elevated border border-white/10">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === "all"
                  ? "bg-gold text-slate-950 font-bold shadow-glow"
                  : "text-parchment-muted hover:text-parchment-100"
              }`}
            >
              All Readers
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to view your friends feed");
                  return;
                }
                setFilter("following");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === "following"
                  ? "bg-gold text-slate-950 font-bold shadow-glow"
                  : "text-parchment-muted hover:text-parchment-100"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
              </div>
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <ReviewCard key={act._id} review={act} showBookInfo={true} />
              ))
            ) : (
              <div className="py-20 text-center rounded-2xl glass-panel border border-white/5 p-8 max-w-lg mx-auto space-y-3">
                <Users className="w-10 h-10 text-parchment-muted/40 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-parchment-100">
                  {filter === "following" ? "No friends activity yet" : "No recent activity"}
                </h3>
                <p className="text-xs text-parchment-muted leading-relaxed">
                  {filter === "following"
                    ? "Follow fellow readers on Bookmate to see their live reviews, half-star ratings, and reading updates here."
                    : "Be the first to log a book or post a review to spark discussion!"}
                </p>
                {filter === "following" && (
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="mt-2 px-4 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider"
                  >
                    Switch to Global Feed
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Suggested Readers */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <h2 className="font-serif text-lg font-bold text-parchment-100">
                  Readers to Follow
                </h2>
              </div>
              <p className="text-xs text-parchment-muted leading-relaxed">
                Connect with active bibliophiles, critics, and book club curators.
              </p>

              <div className="space-y-4 pt-2">
                {suggestedUsers.map((u) => {
                  const isFol = !!followingMap[u.username];

                  return (
                    <div
                      key={u._id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background-elevated border border-white/5"
                    >
                      <Link
                        href={`/profile/${u.username}`}
                        className="flex items-center gap-2.5 min-w-0 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatarUrl || `https://avatar.vercel.sh/${u.username}.png`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-parchment-100 group-hover:text-gold transition-colors truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-parchment-muted truncate">
                            @{u.username}
                          </p>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleFollowToggle(u.username)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                          isFol
                            ? "bg-white/10 text-parchment-200 hover:bg-red-500/20 hover:text-red-300"
                            : "bg-gold text-slate-950 hover:bg-gold-dark shadow-glow"
                        }`}
                      >
                        {isFol ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
