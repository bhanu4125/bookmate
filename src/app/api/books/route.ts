import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const genre = searchParams.get("genre");
    const sort = searchParams.get("sort") || "popular";
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const featured = searchParams.get("featured");

    const query: any = {};
    if (genre && genre !== "All") {
      query.genres = { $regex: new RegExp(`^${genre}$`, "i") };
    }
    if (featured === "true") {
      query.featured = true;
    }

    let sortOption: any = { ratingsCount: -1, averageRating: -1 };
    if (sort === "top-rated") {
      sortOption = { averageRating: -1, ratingsCount: -1 };
    } else if (sort === "newest") {
      sortOption = { publishYear: -1, createdAt: -1 };
    } else if (sort === "trending") {
      sortOption = { readsCount: -1, ratingsCount: -1 };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Fetch books error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch books" },
      { status: 500 }
    );
  }
}
