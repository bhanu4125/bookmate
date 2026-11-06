"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Layers, Plus, Heart, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";

export default function ListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLists() {
      try {
        const res = await fetch("/api/lists");
        if (res.ok) {
          const data = await res.json();
          setLists(data.lists || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLists();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              User Curations & Themed Shelves
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
              Curated Lists
            </h1>
          </div>

          <Link
            href="/lists/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-glow hover:shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create a List</span>
          </Link>
        </div>

        {/* Lists Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
          </div>
        ) : lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const previewBooks = (list.books || []).slice(0, 5);

              return (
                <Link
                  key={list._id}
                  href={`/lists/${list.slug}`}
                  className="group flex flex-col justify-between p-6 rounded-2xl glass-panel border border-white/10 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 shadow-lg bg-background-card/90"
                >
                  <div className="space-y-4">
                    {/* Overlapping Book Covers Preview (Letterboxd stack style) */}
                    <div className="flex items-center -space-x-4 overflow-hidden py-2 pl-2">
                      {previewBooks.map((entry: any, idx: number) => {
                        const book = entry.book || {};
                        return (
                          <div
                            key={idx}
                            style={{ zIndex: 10 - idx }}
                            className="w-16 h-24 rounded-md overflow-hidden shadow-book border border-white/15 bg-background-elevated shrink-0 transition-transform group-hover:translate-x-1"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={book.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300"}
                              alt={book.title || "Book"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {list.isRanked && (
                          <span className="px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 text-[10px] font-bold uppercase tracking-wider">
                            Ranked
                          </span>
                        )}
                        <span className="text-[11px] text-parchment-muted">
                          {list.books?.length || 0} books
                        </span>
                      </div>
                      <h2 className="font-serif text-xl font-bold text-parchment-100 group-hover:text-gold transition-colors line-clamp-1">
                        {list.title}
                      </h2>
                      {list.description && (
                        <p className="text-xs text-parchment-muted mt-1.5 line-clamp-2 leading-relaxed font-sans">
                          {list.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Creator info & likes footer */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-parchment-muted">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={list.user?.avatarUrl || `https://avatar.vercel.sh/${list.user?.username}.png`}
                        alt={list.user?.name}
                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                      />
                      <span className="font-medium text-parchment-300">
                        @{list.user?.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-parchment-muted">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{list.likes?.length || 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center rounded-2xl glass-panel border border-white/5 p-8 max-w-md mx-auto space-y-3">
            <Layers className="w-12 h-12 text-parchment-muted/40 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-parchment-100">
              No lists created yet
            </h3>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Curate your first shelf! Rank your top books, theme a reading list, or catalog your favorite authors.
            </p>
            <Link
              href="/lists/new"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow"
            >
              Create the First List
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
