"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LogModal from "@/components/diary/LogModal";
import { useAuth } from "@/context/AuthContext";

export default function BookLogPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/books/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data.book);
      }
    }
    if (slug) load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        {book && (
          <LogModal
            isOpen={true}
            book={book}
            onClose={() => router.push(`/book/${book.slug || book._id}`)}
            onSuccess={() => router.push(`/book/${book.slug || book._id}`)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
