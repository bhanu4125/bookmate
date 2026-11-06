import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { Book } from "@/models/Book";
import { ReadingLog } from "@/models/ReadingLog";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const userId = searchParams.get("userId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

    const query: any = {};
    if (bookId) query.book = bookId;
    if (userId) query.user = userId;

    const reviews = await Review.find(query)
      .populate("user", "name username avatarUrl")
      .populate("book", "title author coverImage slug publishYear")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
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

    const { bookId, content, rating, containsSpoilers, quotes } = await req.json();

    if (!bookId || !content) {
      return NextResponse.json(
        { error: "Book ID and review content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const review = await Review.create({
      user: user._id,
      book: bookId,
      content,
      rating,
      containsSpoilers: !!containsSpoilers,
      quotes: quotes || [],
    });

    // Also link review to existing or new ReadingLog
    await ReadingLog.findOneAndUpdate(
      { user: user._id, book: bookId },
      {
        $set: {
          review: review._id,
          status: "read",
          ...(rating ? { rating } : {}),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Post review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
