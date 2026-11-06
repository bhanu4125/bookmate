"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookGrid from "@/components/books/BookGrid";
import ReviewCard from "@/components/reviews/ReviewCard";
import SearchModal from "@/components/search/SearchModal";
import LogModal from "@/components/diary/LogModal";
import { BookCardData } from "@/components/books/BookCard";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  Layers,
  Heart,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  const [trendingBooks, setTrendingBooks] = useState<BookCardData[]>([]);
  const [fictionBooks, setFictionBooks] = useState<BookCardData[]>([]);
  const [staffPicks, setStaffPicks] = useState<BookCardData[]>([]);
  const [curatedLists, setCuratedLists] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedBookForLog, setSelectedBookForLog] = useState<any | null>(null);

  useEffect(() => {
    async function loadShowcases() {
      try {
        const [booksRes, fictionRes, listsRes, activityRes] = await Promise.all([
          fetch("/api/books?sort=popular&limit=6"),
          fetch("/api/books?genre=Fiction&limit=6"),
          fetch("/api/lists?sort=popular&limit=3"),
          fetch("/api/activity?limit=3"),
        ]);

        if (booksRes.ok) {
          const bData = await booksRes.json();
          setTrendingBooks(bData.books?.slice(0, 5) || []);
          setStaffPicks(bData.books?.slice(2, 6) || []);
        }

        if (fictionRes.ok) {
          const fData = await fictionRes.json();
          setFictionBooks(fData.books?.slice(0, 5) || []);
        }

        if (listsRes.ok) {
          const lData = await listsRes.json();
          setCuratedLists(lData.lists?.slice(0, 3) || []);
        }

        if (activityRes.ok) {
          const aData = await activityRes.json();
          setRecentReviews(aData.activities?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadShowcases();
  }, []);

  const handleOpenLog = (book: BookCardData) => {
    setSelectedBookForLog(book);
    setLogModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-gold selection:text-black">
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenLogModal={() => setLogModalOpen(true)}
      />

      {/* Editorial Cinematic Hero Banner */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-white/5">
        <div className="absolute inset-0 ambient-glow pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Social Network for Thoughtful Readers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-parchment-100 max-w-4xl mx-auto leading-tight"
          >
            Track books you read. <br />
            Tell friends what’s good.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-parchment-muted max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Log dates in your reading diary, rate with half-star precision, curate custom shelves, and discover your next obsessions through friends.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-glow hover:shadow-lg flex items-center gap-2"
            >
              <span>Explore The Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!user ? (
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-background-elevated hover:bg-background-border border border-white/10 text-parchment-200 text-xs uppercase tracking-wider font-bold transition-colors"
              >
                Create Free Account
              </Link>
            ) : (
              <Link
                href="/diary"
                className="px-6 py-3.5 rounded-xl bg-background-elevated hover:bg-background-border border border-white/10 text-parchment-200 text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-emerald" />
                <span>My Reading Diary</span>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Catalog Showcases */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-16">
        {/* Section 1: Trending This Week */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-2xl font-bold text-parchment-100">
                Trending This Week
              </h2>
            </div>
            <Link
              href="/explore?sort=trending"
              className="text-xs text-gold hover:underline font-semibold uppercase tracking-wider"
            >
              Explore All →
            </Link>
          </div>

          <BookGrid
            books={trendingBooks}
            onLogClick={handleOpenLog}
            columns={5}
          />
        </section>

        {/* Section 2: High-Concept Fiction */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald" />
              <h2 className="font-serif text-2xl font-bold text-parchment-100">
                High-Concept Fiction
              </h2>
            </div>
            <Link
              href="/explore?genre=Fiction"
              className="text-xs text-gold hover:underline font-semibold uppercase tracking-wider"
            >
              View Genre →
            </Link>
          </div>

          <BookGrid
            books={fictionBooks}
            onLogClick={handleOpenLog}
            columns={5}
          />
        </section>

        {/* Section 3: Curated Community Lists */}
        {curatedLists.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-400" />
                <h2 className="font-serif text-2xl font-bold text-parchment-100">
                  Featured Community Lists
                </h2>
              </div>
              <Link
                href="/lists"
                className="text-xs text-gold hover:underline font-semibold uppercase tracking-wider"
              >
                Browse Lists →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {curatedLists.map((list) => {
                const preview = (list.books || []).slice(0, 4);

                return (
                  <Link
                    key={list._id}
                    href={`/lists/${list.slug}`}
                    className="group p-6 rounded-2xl glass-panel border border-white/10 hover:border-gold/30 transition-all bg-background-card/90 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center -space-x-3 overflow-hidden py-1">
                        {preview.map((entry: any, i: number) => (
                          <div
                            key={i}
                            style={{ zIndex: 10 - i }}
                            className="w-14 h-20 rounded overflow-hidden shadow-book border border-white/10 bg-background-elevated shrink-0"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.book?.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300"}
                              alt="Book"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      <h3 className="font-serif text-lg font-bold text-parchment-100 group-hover:text-gold transition-colors line-clamp-1">
                        {list.title}
                      </h3>
                      {list.description && (
                        <p className="text-xs text-parchment-muted line-clamp-2 leading-relaxed">
                          {list.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-parchment-muted">
                      <span>by @{list.user?.username}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {list.likes?.length || 0}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 4: Recent Community Reviews */}
        {recentReviews.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-2xl font-bold text-parchment-100">
                  Recent Activity from Bookmates
                </h2>
              </div>
              <Link
                href="/activity"
                className="text-xs text-gold hover:underline font-semibold uppercase tracking-wider"
              >
                Community Stream →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentReviews.map((rev) => (
                <ReviewCard key={rev._id} review={rev} showBookInfo={true} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Global Search Command Palette */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onLogClick={handleOpenLog}
      />

      {/* Global Log Modal */}
      {logModalOpen && (
        <LogModal
          isOpen={logModalOpen}
          book={selectedBookForLog}
          onClose={() => setLogModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
