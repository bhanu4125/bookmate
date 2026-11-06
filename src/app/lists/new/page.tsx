"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  BookOpen,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface SelectedBook {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  note?: string;
}

export default function NewListPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRanked, setIsRanked] = useState(false);
  const [tags, setTags] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<SelectedBook[]>([]);

  // Book search modal / dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addBook = (book: any) => {
    if (selectedBooks.some((b) => b._id === book._id)) {
      toast.info("Book is already in this list");
      return;
    }

    setSelectedBooks([
      ...selectedBooks,
      {
        _id: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        note: "",
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeBook = (id: string) => {
    setSelectedBooks(selectedBooks.filter((b) => b._id !== id));
  };

  const moveBook = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedBooks.length) return;

    const copy = [...selectedBooks];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setSelectedBooks(copy);
  };

  const updateNote = (index: number, note: string) => {
    const copy = [...selectedBooks];
    copy[index].note = note;
    setSelectedBooks(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to create a list");
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      toast.error("Please provide a list title");
      return;
    }

    if (selectedBooks.length === 0) {
      toast.error("Please add at least one book to the list");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          isRanked,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          books: selectedBooks.map((b) => ({
            bookId: b._id,
            note: b.note,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create list");
      }

      const data = await res.json();
      toast.success("List created successfully!");
      router.push(`/lists/${data.list.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create list");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="pb-6 border-b border-white/10">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Curate & Share
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment-100">
            Create a New List
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-2">
              List Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Books that altered my brain chemistry"
              className="w-full px-4 py-3 rounded-xl bg-background-elevated border border-background-border text-sm text-parchment-100 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your list some editorial flavor or context..."
              className="w-full p-3 rounded-xl bg-background-elevated border border-background-border text-sm text-parchment-100 focus:outline-none focus:border-gold leading-relaxed"
            />
          </div>

          {/* Ranked Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background-elevated border border-white/5">
            <div>
              <p className="text-sm font-semibold text-parchment-100">Ranked List</p>
              <p className="text-xs text-parchment-muted">
                Display numerical rankings (#1, #2, #3...) next to each book
              </p>
            </div>
            <input
              type="checkbox"
              checked={isRanked}
              onChange={(e) => setIsRanked(e.target.checked)}
              className="w-5 h-5 rounded text-gold focus:ring-gold bg-background-card border-white/20 cursor-pointer"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="fiction, comfort, dark-academia, favorites"
              className="w-full px-4 py-2.5 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Book Search and Add */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider">
              Add Books to List ({selectedBooks.length} added)
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search catalog by title, author..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-elevated border border-background-border text-xs text-parchment-100 focus:outline-none focus:border-gold"
              />
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="rounded-xl glass-panel border border-white/10 p-2 max-h-60 overflow-y-auto space-y-1 z-20">
                {searchResults.map((b) => (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => addBook(b)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-8 h-12 object-cover rounded shadow border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-parchment-100 truncate">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-parchment-muted truncate">
                        {b.author}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-gold shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Books Reorder List */}
          {selectedBooks.length > 0 && (
            <div className="space-y-3 pt-2">
              {selectedBooks.map((b, idx) => (
                <div
                  key={b._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-background-card border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gold w-6 text-center">
                      #{idx + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-9 h-14 object-cover rounded shadow border border-white/10"
                    />
                    <div className="w-48 truncate">
                      <p className="text-xs font-bold text-parchment-100 truncate">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-parchment-muted truncate">
                        {b.author}
                      </p>
                    </div>
                  </div>

                  {/* Note input */}
                  <input
                    type="text"
                    value={b.note}
                    onChange={(e) => updateNote(idx, e.target.value)}
                    placeholder="Add a custom note/reflection for this entry..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-background-elevated border border-white/10 text-xs text-parchment-200 focus:outline-none focus:border-gold"
                  />

                  {/* Controls: Up, Down, Delete */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBook(idx, "up")}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-parchment-muted hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === selectedBooks.length - 1}
                      onClick={() => moveBook(idx, "down")}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-parchment-muted hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBook(b._id)}
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
            <Link
              href="/lists"
              className="px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-parchment-muted hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || selectedBooks.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish List"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

