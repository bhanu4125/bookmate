import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { connectToDatabase } from "@/lib/mongodb";
import { ReadingLog } from "@/models/ReadingLog";
import { Book } from "@/models/Book";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const year = searchParams.get("year");

    const query: any = { user: user._id };
    if (status && status !== "all") {
      query.status = status;
    }
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      query.readDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const logs = await ReadingLog.find(query)
      .populate("book")
      .populate("review")
      .sort({ readDate: -1 })
      .lean();

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Fetch logs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, status, rating, format, isReread, notes, tags, readDate } = body;

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Find existing log or create new
    let log = await ReadingLog.findOne({ user: user._id, book: bookId });

    const prevRating = log?.rating;

    if (log) {
      if (status) log.status = status;
      if (rating !== undefined) log.rating = rating;
      if (format) log.format = format;
      if (isReread !== undefined) log.isReread = isReread;
      if (notes !== undefined) log.notes = notes;
      if (tags) log.tags = tags;
      if (readDate) log.readDate = new Date(readDate);
      await log.save();
    } else {
      log = await ReadingLog.create({
        user: user._id,
        book: bookId,
        status: status || "read",
        rating: rating || undefined,
        format: format || "Paperback",
        isReread: isReread || false,
        notes: notes || "",
        tags: tags || [],
        readDate: readDate ? new Date(readDate) : new Date(),
      });
    }

    // Recalculate book rating distribution if rating changed
    if (rating !== undefined && rating !== prevRating) {
      const allRatings = await ReadingLog.find({
        book: bookId,
        rating: { $exists: true, $gt: 0 },
      }).select("rating");

      const dist: Record<string, number> = {
        "0.5": 0, "1.0": 0, "1.5": 0, "2.0": 0, "2.5": 0,
        "3.0": 0, "3.5": 0, "4.0": 0, "4.5": 0, "5.0": 0,
      };

      let sum = 0;
      for (const r of allRatings) {
        const key = r.rating!.toFixed(1);
        if (dist[key] !== undefined) {
          dist[key] += 1;
        }
        sum += r.rating!;
      }

      const count = allRatings.length;
      book.ratingDistribution = dist as any;
      book.ratingsCount = count;
      book.averageRating = count > 0 ? Number((sum / count).toFixed(2)) : 0;
      await book.save();
    }

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Save log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save reading log" },
      { status: 500 }
    );
  }
}

