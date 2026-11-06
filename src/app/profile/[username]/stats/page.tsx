"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BarChart3,
  BookOpen,
  Star,
  Repeat,
  Layers,
  ArrowLeft,
  PieChart,
  TrendingUp,
} from "lucide-react";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const RATING_KEYS = [
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

export default function UserStatsPage() {
  const params = useParams();
  const username = params?.username as string;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`/api/users/${username}/stats`);
        if (res.ok) {
          const json = await res.json();
          setStats(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (username) loadStats();
  }, [username]);

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

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-sm text-parchment-muted">No statistics found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { overview, topGenres, formatCounts, ratingDistribution, monthlyVelocity, currentYear } =
    stats;

  const maxMonthBooks = Math.max(...monthlyVelocity, 1);
  const maxRatingCount = Math.max(
    ...RATING_KEYS.map((k) => ratingDistribution[k] || 0),
    1
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Navigation back to profile */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <Link
              href={`/profile/${username}`}
              className="inline-flex items-center gap-1.5 text-xs text-parchment-muted hover:text-gold transition-colors mb-2 font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to @{username}&apos;s Profile</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
              Reading Analytics & Velocity
            </h1>
          </div>
          <span className="text-xs font-mono text-gold px-3 py-1.5 rounded-full bg-gold/10 border border-gold/25 font-bold">
            Year in Books • {currentYear}
          </span>
        </div>

        {/* High Level Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-2 bg-background-card/80">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-parchment-muted">
              Books Finished
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
                {overview.totalBooks}
              </span>
              <BookOpen className="w-4 h-4 text-gold ml-auto" />
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-2 bg-background-card/80">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-parchment-muted">
              Total Pages Read
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
                {overview.totalPages.toLocaleString()}
              </span>
              <Layers className="w-4 h-4 text-emerald ml-auto" />
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-2 bg-background-card/80">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-parchment-muted">
              Avg Rating Given
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
                {overview.averageRatingGiven ? overview.averageRatingGiven.toFixed(2) : "—"}
              </span>
              <Star className="w-4 h-4 text-gold fill-gold ml-auto" />
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-2 bg-background-card/80">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-parchment-muted">
              Re-reads Logged
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
                {overview.rereadsCount}
              </span>
              <Repeat className="w-4 h-4 text-blue-400 ml-auto" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Velocity Bar Chart */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 space-y-6 bg-background-card/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <h3 className="font-serif text-lg font-bold text-parchment-100">
                  Reading Velocity ({currentYear})
                </h3>
              </div>
              <span className="text-xs text-parchment-muted font-mono">
                Books / month
              </span>
            </div>

            <div className="flex items-end gap-2 h-44 pt-4 px-2">
              {monthlyVelocity.map((count: number, idx: number) => {
                const heightPercent = Math.max(Math.round((count / maxMonthBooks) * 100), 5);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] text-gold font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-sm bg-parchment-muted/30 group-hover:bg-gold transition-colors"
                    />
                    <span className="text-[10px] text-parchment-muted mt-2 font-mono">
                      {MONTH_NAMES[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Rating Curve (10 bars) */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 space-y-6 bg-background-card/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gold" />
                <h3 className="font-serif text-lg font-bold text-parchment-100">
                  Rating Distribution Curve
                </h3>
              </div>
              <span className="text-xs text-parchment-muted font-mono">½ to 5 stars</span>
            </div>

            <div className="flex items-end gap-1.5 h-44 pt-4 px-2">
              {RATING_KEYS.map((key) => {
                const count = ratingDistribution[key] || 0;
                const heightPercent = Math.max(Math.round((count / maxRatingCount) * 100), 5);
                return (
                  <div key={key} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] text-gold font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-sm bg-parchment-muted/30 group-hover:bg-emerald transition-colors"
                    />
                    <span className="text-[9px] text-parchment-muted mt-2 font-mono">
                      {key}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Genres & Formats Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most-Read Genres */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 space-y-5 bg-background-card/80">
            <h3 className="font-serif text-lg font-bold text-parchment-100">
              Most-Read Genres
            </h3>

            {topGenres.length > 0 ? (
              <div className="space-y-3.5">
                {topGenres.map((g: any) => (
                  <div key={g.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-parchment-200">{g.name}</span>
                      <span className="text-parchment-muted font-mono">
                        {g.count} books ({g.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background-elevated overflow-hidden">
                      <div
                        style={{ width: `${g.percent}%` }}
                        className="h-full bg-gold rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-parchment-muted">No genres logged yet.</p>
            )}
          </div>

          {/* Reading Formats Breakdown */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 space-y-5 bg-background-card/80">
            <h3 className="font-serif text-lg font-bold text-parchment-100">
              Reading Mediums & Formats
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formatCounts).map(([fmt, count]: any) => (
                <div
                  key={fmt}
                  className="p-4 rounded-xl bg-background-elevated border border-white/5 space-y-1"
                >
                  <p className="text-[11px] uppercase tracking-wider text-parchment-muted font-semibold">
                    {fmt}
                  </p>
                  <p className="font-serif text-2xl font-bold text-parchment-100">
                    {count} <span className="text-xs text-parchment-muted font-sans font-normal">books</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
