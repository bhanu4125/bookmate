"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookGrid from "@/components/books/BookGrid";
import LogModal from "@/components/diary/LogModal";
import { BookCardData } from "@/components/books/BookCard";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

const GENRES = [
  "All",
  "Fiction",
  "Sci-Fi",
  "Classics",
  "Fantasy",
  "Mystery",
  "Philosophy",
  "Non-Fiction",
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "top-rated", label: "Top Rated" },
  { value: "trending", label: "Trending Reads" },
  { value: "newest", label: "Recently Published" },
];

export default function ExplorePage() {
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Quick log modal state
  const [selectedBookForLog, setSelectedBookForLog] = useState<any | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/books?sort=${sort}&limit=30`;
      if (genre !== "All") {
        url += `&genre=${encodeURIComponent(genre)}`;
      }

      if (search.trim()) {
        const searchRes = await fetch(`/api/books/search?q=${encodeURIComponent(search)}`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          setBooks(searchData.results || []);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [genre, sort, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleOpenLog = (book: BookCardData) => {
    setSelectedBookForLog(book);
    setLogModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            The Literary Catalog
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-parchment-100 tracking-tight">
                Explore Books
              </h1>
              <p className="text-xs sm:text-sm text-parchment-muted mt-1 max-w-xl font-sans">
                Browse acclaimed fiction, timeless masterworks, and modern bestsellers. Rate with half-star precision and add to your shelf.
              </p>
            </div>

            {/* Live catalog search */}
            <div className="w-full md:w-72 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-background-elevated border border-white/10 text-xs text-parchment-100 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-white/10">
          {/* Genre Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  genre === g
                    ? "bg-gold text-slate-950 font-bold shadow-glow"
                    : "bg-white/5 hover:bg-white/10 text-parchment-300 border border-white/5"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-parchment-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background-elevated border border-white/10 text-xs text-parchment-200 focus:outline-none focus:border-gold"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-background-card">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
          </div>
        ) : (
          <BookGrid
            books={books}
            onLogClick={handleOpenLog}
            emptyMessage="No books matched your filter. Try exploring another genre or search term."
            columns={5}
          />
        )}
      </main>

      {/* Log Modal */}
      {logModalOpen && selectedBookForLog && (
        <LogModal
          isOpen={logModalOpen}
          book={selectedBookForLog}
          onClose={() => setLogModalOpen(false)}
          onSuccess={() => fetchBooks()}
        />
      )}

      <Footer />
    </div>
  );
}
