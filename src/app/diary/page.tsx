"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RatingStars from "@/components/books/RatingStars";
import { useAuth } from "@/context/AuthContext";
import { Calendar, BookOpen, Repeat, Star, Filter, Eye, Layers } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DiaryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchDiary() {
      try {
        const res = await fetch("/api/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDiary();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (formatFilter !== "all" && log.format !== formatFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              Personal Reading History
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
              The Reading Diary
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-background-elevated border border-white/10 text-xs text-parchment-200 focus:outline-none focus:border-gold"
            >
              <option value="all">All Formats</option>
              <option value="Paperback">Paperback</option>
              <option value="Hardcover">Hardcover</option>
              <option value="Kindle / E-Book">Kindle / E-Book</option>
              <option value="Audiobook">Audiobook</option>
            </select>
          </div>
        </div>

        {/* Diary List / Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-parchment-muted bg-background-subtle">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Book</th>
                    <th className="py-3 px-4 font-semibold">Released</th>
                    <th className="py-3 px-4 font-semibold">Format</th>
                    <th className="py-3 px-4 font-semibold">Rating</th>
                    <th className="py-3 px-4 font-semibold text-center">Re-read</th>
                    <th className="py-3 px-4 font-semibold">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-parchment-200">
                  {filteredLogs.map((log) => {
                    const book = log.book || {};
                    return (
                      <tr
                        key={log._id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Date */}
                        <td className="py-4 px-4 font-mono text-[11px] text-parchment-muted whitespace-nowrap">
                          {formatDate(log.readDate)}
                        </td>

                        {/* Book with cover */}
                        <td className="py-4 px-4">
                          <Link
                            href={`/book/${book.slug || book._id}`}
                            className="flex items-center gap-3 group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-9 h-14 object-cover rounded shadow border border-white/10 group-hover:scale-105 transition-transform"
                            />
                            <div>
                              <p className="font-semibold text-parchment-100 group-hover:text-gold transition-colors line-clamp-1">
                                {book.title}
                              </p>
                              <p className="text-[11px] text-parchment-muted line-clamp-1">
                                {book.author}
                              </p>
                            </div>
                          </Link>
                        </td>

                        {/* Released year */}
                        <td className="py-4 px-4 text-parchment-muted font-sans">
                          {book.publishYear || "—"}
                        </td>

                        {/* Format */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-parchment-300">
                            {log.format || "Paperback"}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {log.rating ? (
                            <RatingStars rating={log.rating} size="sm" showValue />
                          ) : (
                            <span className="text-parchment-muted/50">—</span>
                          )}
                        </td>

                        {/* Re-read */}
                        <td className="py-4 px-4 text-center">
                          {log.isReread ? (
                            <Repeat className="w-4 h-4 text-emerald mx-auto" />
                          ) : (
                            <span className="text-parchment-muted/30">—</span>
                          )}
                        </td>

                        {/* Review snippet */}
                        <td className="py-4 px-4 max-w-xs truncate text-[11px] text-parchment-muted italic">
                          {log.notes || log.review?.content || "No review written"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center rounded-2xl glass-panel border border-white/5 p-8 max-w-xl mx-auto space-y-4">
            <BookOpen className="w-12 h-12 text-parchment-muted/40 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-parchment-100">
              Your diary is waiting
            </h3>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Start recording books as you finish them. Your diary captures chronological read dates, editions, star ratings, and reflections.
            </p>
            <Link
              href="/explore"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow"
            >
              Browse Books to Log
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

