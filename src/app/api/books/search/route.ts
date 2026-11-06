import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { searchOpenLibrary } from "@/services/bookService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    await connectToDatabase();

    // 1. Search existing local MongoDB books
    const regex = new RegExp(q, "i");
    const localBooks = await Book.find({
      $or: [{ title: regex }, { author: regex }, { genres: regex }],
    })
      .limit(8)
      .lean();

    // If local results are plenty, return them
    if (localBooks.length >= 6) {
      return NextResponse.json({
        source: "local",
        results: localBooks,
      });
    }

    // 2. Fetch external books from Open Library
    const externalBooks = await searchOpenLibrary(q, 8);

    // Merge without duplicates
    const combined = [...localBooks];
    const seenTitles = new Set(localBooks.map((b) => b.title.toLowerCase()));

    for (const ext of externalBooks) {
      if (!seenTitles.has(ext.title.toLowerCase())) {
        seenTitles.add(ext.title.toLowerCase());
        combined.push({
          ...ext,
          _id: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          isExternal: true,
          averageRating: 4.1,
          ratingsCount: 0,
        } as any);
      }
    }

    return NextResponse.json({
      source: "hybrid",
      results: combined.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Search books error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search books" },
      { status: 500 }
    );
  }
}
