import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ReadingLog } from "@/models/ReadingLog";
import { Book } from "@/models/Book";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    await connectToDatabase();

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all logs for this user with populated book details
    const logs = await ReadingLog.find({ user: user._id, status: "read" })
      .populate("book")
      .lean();

    const totalBooks = logs.length;
    let totalPages = 0;
    let totalRatingSum = 0;
    let ratedBooksCount = 0;
    let rereadsCount = 0;

    const genreCounts: Record<string, number> = {};
    const formatCounts: Record<string, number> = {
      Paperback: 0,
      Hardcover: 0,
      "Kindle / E-Book": 0,
      Audiobook: 0,
    };
    const ratingDistribution: Record<string, number> = {
      "0.5": 0, "1.0": 0, "1.5": 0, "2.0": 0, "2.5": 0,
      "3.0": 0, "3.5": 0, "4.0": 0, "4.5": 0, "5.0": 0,
    };

    // Monthly velocity for the current year
    const monthlyVelocity: number[] = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    for (const log of logs) {
      const book: any = log.book || {};
      totalPages += log.pagesRead || book.pageCount || 300;

      if (log.isReread) rereadsCount++;

      if (log.format && formatCounts[log.format] !== undefined) {
        formatCounts[log.format]++;
      }

      if (log.rating && log.rating > 0) {
        ratedBooksCount++;
        totalRatingSum += log.rating;
        const key = log.rating.toFixed(1);
        if (ratingDistribution[key] !== undefined) {
          ratingDistribution[key]++;
        }
      }

      if (book.genres && Array.isArray(book.genres)) {
        for (const g of book.genres) {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      }

      if (log.readDate) {
        const d = new Date(log.readDate);
        if (d.getFullYear() === currentYear) {
          monthlyVelocity[d.getMonth()]++;
        }
      }
    }

    // Sort genres by frequency
    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalBooks > 0 ? Math.round((count / totalBooks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const averageRatingGiven =
      ratedBooksCount > 0 ? Number((totalRatingSum / ratedBooksCount).toFixed(2)) : 0;

    return NextResponse.json({
      user: {
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      overview: {
        totalBooks,
        totalPages,
        averageRatingGiven,
        rereadsCount,
      },
      topGenres,
      formatCounts,
      ratingDistribution,
      monthlyVelocity,
      currentYear,
    });
  } catch (error: any) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate user stats" },
      { status: 500 }
    );
  }
}
