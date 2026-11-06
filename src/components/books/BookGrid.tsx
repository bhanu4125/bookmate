"use client";

import { motion } from "framer-motion";
import BookCard, { BookCardData } from "./BookCard";
import { BookOpen } from "lucide-react";

interface BookGridProps {
  books: BookCardData[];
  onLogClick?: (book: BookCardData) => void;
  emptyMessage?: string;
  columns?: 4 | 5 | 6;
}

export default function BookGrid({
  books,
  onLogClick,
  emptyMessage = "No books found matching this criteria.",
  columns = 5,
}: BookGridProps) {
  if (!books || books.length === 0) {
    return (
      <div className="w-full py-16 text-center rounded-2xl border border-white/5 bg-background-card/50 p-8">
        <BookOpen className="w-10 h-10 text-parchment-muted/50 mx-auto mb-3" />
        <p className="text-sm text-parchment-muted font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const gridColsClass = {
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  }[columns];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid ${gridColsClass} gap-4 sm:gap-6`}
    >
      {books.map((book) => (
        <motion.div key={book._id || book.slug} variants={itemVariants}>
          <BookCard book={book} onLogClick={onLogClick} />
        </motion.div>
      ))}
    </motion.div>
  );
}

