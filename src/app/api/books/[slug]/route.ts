import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { Review } from "@/models/Review";
import { List } from "@/models/List";
import { ReadingLog } from "@/models/ReadingLog";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    await connectToDatabase();

    // Find book by slug or by ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const book = await Book.findOne({
      $or: [{ slug }, ...(isObjectId ? [{ _id: slug }] : [])],
    }).lean();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Fetch popular community reviews
    const reviews = await Review.find({ book: book._id })
      .populate("user", "name username avatarUrl")
      .sort({ "likes.length": -1, createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch lists featuring this book
    const lists = await List.find({ "books.book": book._id, isPrivate: false })
      .populate("user", "name username avatarUrl")
      .limit(5)
      .lean();

    // Check user's activity on this book if logged in
    const currentUser = await getCurrentUser();
    let userActivity = null;

    if (currentUser) {
      const userLog = await ReadingLog.findOne({
        user: currentUser._id,
        book: book._id,
      })
        .sort({ readDate: -1 })
        .lean();

      const userReview = await Review.findOne({
        user: currentUser._id,
        book: book._id,
      }).lean();

      userActivity = {
        hasLogged: !!userLog,
        status: userLog?.status || null,
        rating: userLog?.rating || userReview?.rating || null,
        format: userLog?.format || null,
        readDate: userLog?.readDate || null,
        review: userReview || null,
      };
    }

    return NextResponse.json({
      book,
      reviews,
      lists,
      userActivity,
    });
  } catch (error: any) {
    console.error("Book detail error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load book" },
      { status: 500 }
    );
  }
}

